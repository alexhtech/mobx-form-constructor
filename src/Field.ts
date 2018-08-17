import { action, observable } from 'mobx'
import get from 'lodash.get'

import { Form, FormModel } from './Form'
import BaseField from './BaseField'

export const enum FieldTypes {
    Default = 'input',
    Checkbox = 'checkbox'
}

export class Field extends BaseField {
    constructor(field: FormModel, form: Form, initialValue?: any) {
        super()
        this.form = form
        this.name = field.name
        this.type = field.type || FieldTypes.Default
        this.value = field.value || initialValue || get(form.initialValues, field.name) || ''
        if (field.validate) {
            this.validate = field.validate
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
    }

    public bind = () => {
        const { onChange, onFocus, onBlur, value, error, name, type } = this
        const bindings = {
            onChange,
            onFocus,
            onBlur,
            value,
            error,
            name,
            checked: undefined
        }

        if (type === FieldTypes.Checkbox) {
            bindings.checked = value
        }

        return bindings
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

        if (e && e.target && (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement)) {
            if (this.type === FieldTypes.Checkbox) {
                $value = !this.value
                this.touched = true
            } else {
                $value = e.target.value
            }
        } else {
            $value = e
        }

        this.value = this.normalize ? this.normalize($value, this) : $value

        this.form.validateForm()

        if (this.form.didChange) {
            this.form.didChange(this.form.getValues(), this, this.form)
        }

        if (this.didChange) {
            this.didChange(this, this.form)
        }
    }
}
