import { Form, Validate } from './Form'
import { observable, action, runInAction } from 'mobx'

abstract class BaseField {
    public name: string

    @observable public value: any

    @observable public error?: any = ''

    public form: Form

    public initialValue?: any

    public validate?: Validate

    public validating: boolean = false

    @action
    public set = (property: string, value: any) => {
        this[property] = value
    }

    public _validate = async () => {
        let valid: boolean = true
        if (this.validate) {
            try {
                runInAction(() => {
                    this.validating = true
                })
                const error = await this.validate(this as any)
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
