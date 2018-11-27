import { action, observable, computed } from 'mobx'
import isEqual from 'lodash.isequal'
import { Form, IModel } from './Form'
import BaseField from './BaseField'
import { FieldArray } from './FieldArray'

export enum FieldTypes {
    Default = 'input',
    Checkbox = 'checkbox',
    Radio = 'radio'
}

export type ValidatorType = (field: Field | FieldArray, form: Form) => Promise<string | boolean> | string | boolean

export type NormalizerType = (value: any, field: Field) => any

export class Field extends BaseField {
    @observable
    public active: boolean = false

    @observable
    public touched: boolean = false

    @observable
    public visited: boolean = false

    public normalizer?: NormalizerType | NormalizerType[]

    constructor(field: IModel, form: Form, initialValue?: any) {
        super()
        this.form = form
        this.name = field.name
        this.label = field.label
        this.value = initialValue

        if (field.validator) {
            this.validator = field.validator
        }

        if (field.didChange) {
            this.didChange = field.didChange
        }

        if (field.normalizer) {
            this.normalizer = field.normalizer
        }

        this.initialValue = this.value

        return this
    }

    public didChange?(field: Field, form: Form): any

    public didBlur?(field: Field, form: Form): any

    public didFocus?(field: Field, form: Form): any

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
            this.form.didChange(this.form.getValues(), this.form)
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
            this.form.didChange(this.form.getValues(), this.form)
        }
    }

    public bind = (fieldType: FieldTypes, fieldValue?: string) => {
        const { onChange, onFocus, onBlur, value, error } = this

        switch (fieldType) {
            case FieldTypes.Checkbox: {
                return { onChange, onFocus, onBlur, error, checked: value }
            }

            case FieldTypes.Radio: {
                return { onChange, onFocus, onBlur, error, checked: fieldValue === value }
            }

            default:
                return { onChange, onFocus, onBlur, value, error }
        }
    }

    @action
    public onBlur = () => {
        this.touched = true
        this.active = false
        if (this.didBlur) this.didBlur(this, this.form)
    }

    @action
    public onFocus = () => {
        this.active = true
        this.form.validate()
        this.form.set('pristine', false)
        if (this.didFocus) this.didFocus(this, this.form)
    }

    @action
    public onChange = (e: any) => {
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

        this.value = this.normalizer
            ? Array.isArray(this.normalizer)
                ? this.normalizer.reduce((value, normalizer) => normalizer(value, this), $value)
                : this.normalizer($value, this)
            : $value

        this.form.validate()

        if (this.form.didChange) {
            this.form.didChange(this.form.getValues(), this.form)
        }

        if (this.didChange) {
            this.didChange(this, this.form)
        }
    }

    @computed
    public get changed() {
        return !isEqual(this.value, this.initialValue)
    }
}
