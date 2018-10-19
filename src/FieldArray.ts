import { action } from 'mobx'
import { Form, IModel } from './Form'
import BaseField from './BaseField'
import { Field } from './Field'

export class FieldArray extends BaseField {
    public static sliceName = (name: string) => name.slice(0, -2)

    public model: IModel[] = [{ name: '' }]

    constructor(field: IModel, form: Form, initialValue?: any) {
        super()
        this.name = FieldArray.sliceName(field.name)
        this.form = form
        this.validator = field.validator

        if (field.model) {
            this.model = field.model
        }

        this.value = this.parseValue(initialValue || [])
    }

    public didChange?(fieldArray: FieldArray, form: Form): any

    public push = (...item: any[]) => {
        this.value.push(...item.map(el => this.parseValue(el)))
        if (this.didChange) {
            this.didChange(this, this.form)
        }
        if (this.form.didChange) {
            this.form.didChange(this.form.getValues(), this.form)
        }
    }

    public unshift = (...item: any[]) => {
        this.value.unshift(...item.map(el => this.parseValue(el)))
        if (this.didChange) {
            this.didChange(this, this.form)
        }
        if (this.form.didChange) {
            this.form.didChange(this.form.getValues(), this.form)
        }
    }

    public concat = (...array: any[][]) => {
        this.value = this.value.concat(...array.map(item => this.parseValue(item)))
        if (this.didChange) {
            this.didChange(this, this.form)
        }
        if (this.form.didChange) {
            this.form.didChange(this.form.getValues(), this.form)
        }
    }

    @action
    public reset = (value = this.initialValue) => {
        this.value = this.parseValue(value || [])
        if (this.didChange) {
            this.didChange(this, this.form)
        }
        if (this.form.didChange) {
            this.form.didChange(this.form.getValues(), this.form)
        }
        this.error = ''
    }

    @action
    public set = (key: string, value: any) => {
        if (key === 'value') {
            this.value = this.parseValue(value || [])
        } else {
            this[key] = value
        }
    }

    @action
    public onChange(value: any) {
        this.value = this.parseValue(value || [])
    }

    private parseValue = (value: any[] | any): Field[] | Field => {
        if (Array.isArray(value)) {
            return value.map(item => {
                const obj = {}
                Form.initializeFields(obj, this.model, this.form, typeof item !== 'object' ? { '': item } : item)
                if (this.model.length === 1 && this.model[0].name === '') {
                    return obj['']
                } else {
                    return obj
                }
            })
        } else {
            const $obj: any = {}
            Form.initializeFields($obj, this.model, this.form, typeof value !== 'object' ? { '': value } : value)
            if (this.model.length === 1 && this.model[0].name === '') {
                return $obj['']
            } else {
                return $obj
            }
        }
    }
}
