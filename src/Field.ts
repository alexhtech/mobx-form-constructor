import { action, observable } from 'mobx'
import { Form, FormModel } from './Form'
import BaseField from './BaseField'

export const enum FieldTypes {
    Default = 'input',
    Checkbox = 'checkbox',
    Radio = 'radio'
}

export class Field extends BaseField {
    constructor(field: FormModel, form: Form, initialValue?: any) {
        super()
        this.form = form
        this.name = field.name
        this.type = field.type || FieldTypes.Default
        this.value = initialValue

        if (field.validate) {
            this.validate = field.validate
        }

        if (field.didChange) {
            this.didChange = field.didChange
        }

        if (field.normalize) {
            this.normalize = field.normalize
        }

        this.initialValue = this.value

        return this
    }
    public type: FieldTypes

    public active: boolean = false

    @observable public touched: boolean = false

    @observable public visited: boolean = false

    public normalize?(value: any, field: Field): any

    public didChange?(field: Field, form: Form): any

    @action
    public clear = () => {
        this.value = ''
        this.touched = false
        this.visited = false
        this.error = ''

        if (this.didChange) {
            this.didChange(this, this.form)
        }
        if (this.form.didChange) {
            this.form.didChange(this.form.getValues())
        }
    }

    @action
    public reset = (value = this.initialValue) => {
        this.value = value
        this.touched = false
        this.visited = false
        this.error = ''
        if (this.didChange) {
            this.didChange(this, this.form)
        }
        if (this.form.didChange) {
            this.form.didChange(this.form.getValues())
        }
    }

    public bind = (fieldType: FieldTypes, fieldValue?: string) => {
        const { onChange, onFocus, onBlur, value, error } = this

        switch (fieldType) {
            case FieldTypes.Checkbox: {
                return {
                    onChange,
                    onFocus,
                    onBlur,
                    error,
                    checked: value
                }
            }

            case FieldTypes.Radio: {
                return {
                    onChange,
                    onFocus,
                    onBlur,
                    error,
                    checked: fieldValue === value
                }
            }

            default:
                return {
                    onChange,
                    onFocus,
                    onBlur,
                    value,
                    error
                }
        }
    }

    @action
    public onBlur = () => {
        this.touched = true
        this.active = false
    }

    @action
    public onFocus = () => {
        this.active = true
        this.form.validateForm()
        this.form.set('pristine', false)
    }

    @action
    onChange = (e: any) => {
        this.form.set('pristine', false)
        let $value

        if (e && e.target) {
            $value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        } else {
            $value = e
        }

        if (!this.active) {
            this.touched = true
        }

        this.value = this.normalize ? this.normalize($value, this) : $value

        this.form.validateForm()

        if (this.form.didChange) {
            this.form.didChange(this.form.getValues())
        }

        if (this.didChange) {
            this.didChange(this, this.form)
        }
    }
}
