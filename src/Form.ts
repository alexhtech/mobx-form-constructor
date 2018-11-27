import { action, observable, runInAction, computed } from 'mobx'
import { parse } from 'qs'
import merge from 'lodash.merge'
import set from 'lodash.set'
import get from 'lodash.get'
import isEqual from 'lodash.isequal'

import { Field, ValidatorType, NormalizerType } from './Field'
import { FieldArray } from './FieldArray'

export interface IFormProps {
    initialValues?: any
    extra?: any
}

export interface IModel {
    name: string
    label?: string
    value?: any
    validator?: ValidatorType | ValidatorType[]
    model?: IModel[]
    didChange?: (field: Field, form: Form) => any
    didFocus?: (field: Field, form: Form) => any
    didBlur?: (field: Field, form: Form) => any
    info?: any
    normalizer?: NormalizerType | NormalizerType[]
}

export interface IFields {
    [key: string]: Field | FieldArray | any
}

export abstract class Form {
    public static isFieldArray = /d*\[\]$/

    public static initializeFields = (fields: IFields, model: IModel[], form: Form, initialValues: any) => {
        model.forEach(field => {
            if (Form.isFieldArray.test(field.name)) {
                const slicedName = FieldArray.sliceName(field.name)
                set(
                    fields,
                    slicedName,
                    new FieldArray(
                        field,
                        form,
                        field.value !== undefined ? field.value : get(initialValues, slicedName, '') || ''
                    )
                )
            } else {
                set(
                    fields,
                    field.name,
                    new Field(field, form, field.value !== undefined ? field.value : get(initialValues, field.name, ''))
                )
            }
        })
    }

    public initialValues?: any

    public fields: IFields = {}

    @observable
    public submitting: boolean = false

    @observable
    public submitted: boolean = false

    @observable
    public submitFailed: boolean = false

    @observable
    public pristine: boolean = true

    @observable
    public valid: boolean = true

    @observable
    public error: any = ''

    public extra?: any

    private model: IModel[] = []

    constructor(props: IFormProps = {}) {
        this.initialValues = props.initialValues
        if (this.getModel) {
            this.model = this.getModel(props, this)
        }
        this.extra = props.extra
        this.createStructure()
        Form.initializeFields(this.fields, this.model, this, this.initialValues)
    }

    public getModel?(props: IFormProps, form: Form): IModel[]

    public getValues = (fields = this.fields, values = {}): any => {
        Object.keys(fields).forEach(key => {
            const item = fields[key]

            if (item instanceof Field) {
                values[key] = item.value
                return
            }

            if (item instanceof FieldArray) {
                values[key] = item.value.map(
                    (el: { [key: string]: Field } | Field) => (el instanceof Field ? el.value : this.getValues(el, {}))
                )
                return
            }

            values[key] = this.getValues(item, {})
        })

        return values
    }

    public onSubmit?(values: any, form: Form): Promise<any> | any

    public onSubmitSuccess?(response: any, form: Form): void

    public onSubmitFail?(error: any, form: Form): void

    public didChange?(values: any, form: Form): void

    @action
    public handleSubmit = async (e?: any) => {
        if (e) {
            e.preventDefault()
        }

        if (this.pristine) {
            this.set('valid', await this.validate())
        }

        if (this.onSubmit) {
            try {
                runInAction(() => {
                    this.submitting = true
                })
                if (!this.valid) {
                    runInAction(() => {
                        this.submitted = false
                        this.submitting = false
                        this.submitFailed = true
                    })
                    if (this.onSubmitFail) this.onSubmitFail({}, this)
                    return
                }

                const response = await this.onSubmit(this.getValues(), this)
                if (this.onSubmitSuccess) this.onSubmitSuccess(response, this)
                runInAction(() => {
                    this.submitted = true
                    this.submitting = false
                    this.submitFailed = false
                })
            } catch (e) {
                runInAction(() => {
                    this.submitted = true
                    this.submitting = false
                    this.submitFailed = true
                })
                if (this.onSubmitFail) {
                    this.onSubmitFail(e, this)
                }
            }
        }
    }

    @action
    public reset = (clear = false) => {
        this.model.forEach(({ name }) => {
            const fieldName = Form.isFieldArray.test(name) ? FieldArray.sliceName(name) : name
            const field = get(this.fields, fieldName)

            if (clear) {
                field.clear()
            } else {
                field.reset()
            }

            field.set('touched', false)
            field.set('visited', false)
            field.set('error', '')
        })

        this.error = ''
        this.valid = true
        this.submitting = false
        this.submitted = false
        this.submitFailed = false
        this.pristine = true

        if (this.didChange) {
            this.didChange(this.getValues(), this)
        }
    }

    public clear = () => this.reset(true)

    @action
    public set = (property: string, value: any) => {
        this[property] = value
    }

    public validate = async () => {
        const status = await this.validateFields()

        this.set('valid', status)

        return status
    }

    @computed
    public get changed() {
        return !isEqual(this.getValues(), this.initialValues)
    }

    private createStructure = () => {
        this.fields = merge({}, ...this.model.map(field => parse(field.name, { allowDots: true })))
    }

    private validateFields = async (fields: IFields = this.fields, $valid = true) => {
        for (const key of Object.keys(fields)) {
            const field = fields[key]
            if (field instanceof Field) {
                if (!(await field.validate(field))) {
                    $valid = false
                }
            } else if (field instanceof FieldArray) {
                if (!(await field.validate(field))) {
                    $valid = false
                }

                for (const el of field.value) {
                    if (!(el instanceof Field ? await el.validate(el) : await this.validateFields(el, $valid))) {
                        $valid = false
                    }
                }
            } else {
                if (!(await this.validateFields(field, $valid))) {
                    $valid = false
                }
            }
        }
        return $valid
    }
}
