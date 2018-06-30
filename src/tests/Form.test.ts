import { parse } from 'qs'
// import merge = require('lodash.merge')
// import get = require('lodash.get')
// import set = require('lodash.set')

import { Form } from '../Form'

test('init', () => {
    class FormViewModel extends Form {
        getModel() {
            return [
                {
                    name: 'form.company',
                    value: 'Besk'
                },
                {
                    name: 'form.members[]',
                    value: [],
                    model: [
                        {
                            name: 'firstName'
                        },
                        {
                            name: 'lastName'
                        },
                        {
                            name: 'hobbies[]',
                            model: [
                                {
                                    name: 'hobbyName'
                                }
                            ],
                            value: [
                                {
                                    hobbyName: 'teamLead'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }

    const form = new FormViewModel()
    form.fields.form.members.push({
        firstName: 'alex',
        lastName: 'olefirenko'
    })

    console.log(form.fields)
})
