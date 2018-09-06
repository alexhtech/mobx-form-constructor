import { action, observable, runInAction } from 'mobx'
import { parse } from 'qs'
import merge from 'lodash.merge'
import set from 'lodash.set'
import get from 'lodash.get'

import { Field, FieldTypes } from './Field'
import { FieldArray } from './FieldArray'

export interface FormProps {
    initialValues?: any
    extra?: any
}

export type Validate = (field: Field | FieldArray) => Promise<string> | string

export interface FormModel {
    name: string
    value?: any
    validate?: Validate
    type?: FieldTypes
    model?: FormModel[]
    didChange?: (field: Field, form: Form) => any
    normalize?: (value: any, field: Field) => any
}

export abstract class Form {
    public static isFieldArray = /d*\[\]$/

    constructor(props: FormProps = {}) {
        this.initialValues = props.initialValues
        if (this.getModel) {
            this.model = this.getModel(props, this)
        }
        this.extra = props.extra
        this.initialize()
        return this
    }

    public initialValues?: any

    public fields: any = {}

    private model: FormModel[] = []

    @observable public submitting: boolean = false

    @observable public submitted: boolean = false

    @observable public submitFailed: boolean = false

    @observable public pristine: boolean = true

    @observable public valid: boolean = true

    @observable public error: any = ''

    public validate: Validate[] = []

    public extra?: any

    public getModel?(props: FormProps, form: Form): FormModel[]

    private initialize = () => {
        this.createStructure(this.model)
        Form.initializeFields(this.fields, this.model, this)
    }

    private createStructure = (model: FormModel[]) => {
        this.fields = merge({}, ...model.map(field => parse(field.name, { allowDots: true })))
    }

    public static initializeFields = (fields: any, model: FormModel[], form: Form, initialValue: any = {}) => {
        model.forEach(field => {
            if (Form.isFieldArray.test(field.name)) {
                const slicedName = FieldArray.sliceName(field.name)
                set(fields, slicedName, new FieldArray(field, form, field.value || get(initialValue, slicedName)))
            } else {
                set(fields, field.name, new Field(field, form, field.value || get(initialValue, field.name)))
            }
        })
    }

    public getValues = (fields = this.fields, values = {}): any => {
        Object.keys(fields).forEach(key => {
            const item = fields[key]

            if (item instanceof Field) {
                values[key] = item.value
                return
            }

            if (item instanceof FieldArray) {
                values[key] = item.value.map(
                    (item: { [key: string]: Field } | Field) =>
                        item instanceof Field ? item.value : this.getValues(item, {})
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
    public didChange?(value: any, field: Field, form: Form): void

    @action
    public handleSubmit = async (e?: any) => {
        if (e) {
            e.preventDefault()
        }

        if (this.pristine) {
            this.set('valid', await this._validate())
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

    public validateForm = async () => {
        const status = await this._validate()
        this.set('valid', status)
        return status
    }

    private _validate = async (fields: any = this.fields, $valid = true) => {
        for (const key in fields) {
            if (Object.prototype.hasOwnProperty.call(fields, key)) {
                const item = fields[key]

                if (item instanceof Field) {
                    const valid = await item._validate()
                    if (!valid) {
                        $valid = valid
                    }
                } else if (item instanceof FieldArray) {
                    const valid = await item._validate()
                    if (!valid) {
                        $valid = valid
                    }

                    for (const fields of item.value) {
                        const valid =
                            fields instanceof Field ? await fields._validate() : await this._validate(fields, $valid)
                        if (!valid) {
                            $valid = valid
                        }
                    }
                } else {
                    const valid = await this._validate(fields[key], $valid)
                    if (!valid) {
                        $valid = valid
                    }
                }
            }
        }

        return $valid
    }

    @action
    public reset = () => {
        this.initialize()
        this.error = ''
        this.valid = true
        this.submitting = false
        this.submitted = false
        this.submitFailed = false
        this.pristine = true
    }

    @action
    public set = (property: string, value: any) => {
        this[property] = value
    }
}
