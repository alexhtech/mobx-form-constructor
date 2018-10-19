import { observable, action, runInAction } from 'mobx'
import { Form, IFields } from './Form'
import { ValidatorType, Field } from './Field'
import { FieldArray } from './FieldArray'

abstract class BaseField {
    public name: string

    public label?: string

    @observable
    public value: IFields | any

    @observable
    public error?: any = ''

    public form: Form

    public initialValue?: any

    public validator?: ValidatorType | ValidatorType[]

    public validating: boolean = false

    @action
    public set = (property: string, value: any) => {
        this[property] = value
    }

    public validate = async (field: Field | FieldArray = this as any) => {
        let valid: boolean = true
        if (this.validator) {
            try {
                runInAction(() => {
                    this.validating = true
                })
                let error
                if (Array.isArray(this.validator)) {
                    for (const validator of this.validator) {
                        error = await validator(field, this.form)
                        if (error) break
                    }
                } else {
                    error = await this.validator(field, this.form)
                }
                if (error) {
                    this.set('error', error)
                    valid = false
                } else {
                    valid = true
                    this.set('error', '')
                }

                runInAction(() => {
                    this.validating = false
                })
            } catch (e) {
                runInAction(() => {
                    this.validating = false
                })
            }
        }

        return valid
    }
}

export default BaseField
