import get from 'lodash.get'
import { Form, FormModel } from './Form'
import BaseField from './BaseField'
import { Field } from './Field'

export class FieldArray extends BaseField {
    public static sliceName = (name: string) => name.slice(0, -2)

    constructor(field: FormModel, form: Form, initialValue?: any) {
        super()
        this.name = FieldArray.sliceName(field.name)
        this.form = form
        this.validate = field.validate

        if (field.model) {
            this.model = field.model
        }

        this.value = this._parseValue(initialValue || field.value || get(form.initialValues, this.name) || [])
    }

    public model: FormModel[] = [
        {
            name: ''
        }
    ]

    private _parseValue = (value: any[] | any): Field[] | Field => {
        if (Array.isArray(value)) {
            return value.map(item => {
                const value = {}
                Form.initializeFields(value, this.model, this.form, typeof item !== 'object' ? { '': item } : item)
                if (this.model.length === 1 && this.model[0].name === '') {
                    return value['']
                } else {
                    return value
                }
            })
        } else {
            const _value: any = {}
            Form.initializeFields(_value, this.model, this.form, typeof value !== 'object' ? { '': value } : value)
            if (this.model.length === 1 && this.model[0].name === '') {
                return _value['']
            } else {
                return _value
            }
        }
    }

    public push = (...item: any[]) => {
        this.value.push(...item.map(item => this._parseValue(item)))
    }

    public unshift = (...item: any[]) => {
        this.value.unshift(...item.map(item => this._parseValue(item)))
    }

    public concat = (...array: any[][]) => {
        this.value = this.value.concat(...array.map(item => this._parseValue(item)))
    }
}
