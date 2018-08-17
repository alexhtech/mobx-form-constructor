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
