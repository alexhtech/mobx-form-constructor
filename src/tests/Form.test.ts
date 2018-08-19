import { Form } from '../Form'

const model = [
    {
        name: 'company',
        value: 'The best company'
    },
    {
        name: 'members[]',
        model: [
            {
                name: 'firstName'
            },
            {
                name: 'lastName'
            },
            {
                name: 'hobbies[]'
            }
        ]
    }
]

test('Form: init', () => {
    class FormViewModel extends Form {
        getModel() {
            return model
        }
    }

    const form = new FormViewModel()

    expect(form instanceof FormViewModel).toBe(true)
})

test('FieldArray: push', () => {
    class FormViewModel extends Form {
        getModel() {
            return model
        }
    }

    const form = new FormViewModel()

    const member = {
        firstName: 'Michael',
        lastName: 'Jackson',
        hobbies: ['music']
    }

    form.fields.members.push(member)

    expect(form.getValues().members[0]).toEqual(member)
})

test('FieldArray: unshift', () => {
    class FormViewModel extends Form {
        getModel() {
            return model
        }
    }

    const form = new FormViewModel()

    const member = {
        firstName: 'Michael',
        lastName: 'Jackson',
        hobbies: ['music']
    }

    form.fields.members.unshift(member)

    expect(form.getValues().members[0]).toEqual(member)
})

test('FieldArray: concat', () => {
    class FormViewModel extends Form {
        getModel() {
            return model
        }
    }

    const form = new FormViewModel()

    const member = {
        firstName: 'Michael',
        lastName: 'Jackson',
        hobbies: ['music']
    }

    const member2 = {
        firstName: 'Elton',
        lastName: 'Jhon',
        hobbies: ['music']
    }

    form.fields.members.push(member)

    form.fields.members.concat([member2])

    expect(form.getValues().members).toEqual([member, member2])
})

test('Form: submit', async () => {
    let values
    class FormViewModel extends Form {
        getModel() {
            return model
        }
        onSubmit($values) {
            values = $values
        }
    }

    const form = new FormViewModel()

    form.fields.members.push({
        firstName: 'Michael',
        lastName: 'Jackson',
        hobbies: ['music']
    })
    await form.handleSubmit()

    expect(values).toEqual({
        company: 'The best company',
        members: [
            {
                firstName: 'Michael',
                lastName: 'Jackson',
                hobbies: ['music']
            }
        ]
    })
    expect(form.submitted).toBe(true)
    expect(form.submitting).toBe(false)
    expect(form.submitFailed).toBe(false)
})

test('Form: reset', async () => {
    class FormViewModel extends Form {
        getModel() {
            return model
        }
    }

    const form = new FormViewModel()

    form.fields.members.push({
        firstName: 'Michael',
        lastName: 'Jackson',
        hobbies: ['music']
    })

    form.reset()

    expect(form.getValues()).toEqual({
        company: 'The best company',
        members: []
    })
})

test('Form: set fn', () => {
    class FormViewModel extends Form {
        getModel() {
            return model
        }
    }

    const form = new FormViewModel()

    form.set('error', 'test string')

    expect(form.error).toEqual('test string')
})

test('Field: validate', async () => {
    class FormViewModel extends Form {
        getModel() {
            return [
                {
                    name: 'firstName',
                    validate: ({ value }) => !value && 'Required field'
                }
            ]
        }
    }

    const form = new FormViewModel()

    await form.fields.firstName.onChange('')
    await form.validateForm()
    expect(form.fields.firstName.error).toEqual('Required field')
    expect(form.valid).toBe(false)
})

test('Field: onChange', () => {
    class FormViewModel extends Form {
        getModel() {
            return [
                {
                    name: 'firstName'
                }
            ]
        }
    }

    const form = new FormViewModel()
    form.fields.firstName.onChange('Alex')

    expect(form.getValues().firstName).toBe('Alex')
})

test('Field: onFocus', () => {
    class FormViewModel extends Form {
        getModel() {
            return [
                {
                    name: 'firstName'
                }
            ]
        }
    }

    const form = new FormViewModel()

    form.fields.firstName.onFocus()
    expect(form.fields.firstName.active).toBe(true)
    expect(form.pristine).toBe(false)
})

test('Field: onBlur', () => {
    class FormViewModel extends Form {
        getModel() {
            return [
                {
                    name: 'firstName'
                }
            ]
        }
    }

    const form = new FormViewModel()

    form.fields.firstName.onBlur()
    expect(form.fields.firstName.active).toBe(false)
    expect(form.fields.firstName.touched).toBe(true)
})

test('Field: clear', () => {
    class FormViewModel extends Form {
        getModel() {
            return [
                {
                    name: 'firstName'
                }
            ]
        }
    }

    const form = new FormViewModel()

    form.fields.firstName.onChange('Alex')
    form.fields.firstName.clear()
    expect(form.fields.firstName.value).toBe('')
})

test('Field: reset', () => {
    class FormViewModel extends Form {
        getModel() {
            return [
                {
                    name: 'firstName',
                    value: 'Alex'
                }
            ]
        }
    }

    const form = new FormViewModel()

    form.fields.firstName.onChange('Jhon')
    form.fields.firstName.reset()
    expect(form.fields.firstName.value).toBe('Alex')
})
