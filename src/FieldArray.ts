import { action, flow, observable } from 'mobx'
import get from 'lodash.get'

import { Form, FormModel, Validate } from './Form'

export class FieldArray {
    public static sliceName = (name: string) => name.slice(0, -2)

    constructor(field: FormModel, form: Form, initialValue?: any) {
        this.name = FieldArray.sliceName(field.name)
        this.value = initialValue || field.value || get(form.initialValues, this.name) || []
        this.form = form
        this.validate = field.validate
        if (field.model) {
            this.model = field.model
        }
    }

    public name: string
    @observable public value: any
    @observable public error?: any = ''
    public form: Form
    public model?: FormModel[] = [
        {
            name: ''
        }
    ]

    public validate?: Validate
    public validating: boolean = false

    @action
    public set = (property: string, value: any) => {
        this[property] = value
    }

    public $validate = flow(this.validateField.bind(this));

    private *validateField() {
        let valid: boolean = true
        if (this.validate) {
            try {
                this.validating = true
                const error = yield this.validate(this)
                if (error) {
                    this.set('error', error)
                    valid = false
                } else {
                    valid = true
                    this.set('error', '')
                }

                this.validating = false
            } catch (e) {
                this.validating = false
            }
        }

        return valid
    }

    public push = (item: any) => {
        if (this.model) {
            const value: any = {}
            Form.initializeFields(value, this.model, this.form, typeof item !== 'object' ? { '': item } : item)
            if (this.model.length === 1 && !this.model[0].name) {
                this.value.push(value[''])
            } else {
                this.value.push(value)
            }
        }
    }
}
