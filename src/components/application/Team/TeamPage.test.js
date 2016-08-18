import expect from 'expect'
import React from 'react'
import {mount} from 'enzyme'
import TeamPage from './TeamPage'

function setup(newMember = {}) {
  const props = {
    newMember
  }
  return mount(<TeamPage {...props} />)
}

describe('<TeamPage>', () => {
  it('sets error when leaving empty a required field', () => {
    const wrapper = setup()
    const requiredInput = wrapper.find('.required input').first()
    requiredInput.simulate('change', {
      target: {
        name: 'firstname',
        value: ''
      }
    })
    const blockInError = wrapper.find('.has-error')
    expect(blockInError.length).toBe(1)
    expect(blockInError.contains(<div className="help-block">obligatoire</div>)).toBe(true)
  })
  it('does not have any error on first load', () => {
    const wrapper = setup()
    const blockInError = wrapper.find('.has-error')
    expect(blockInError.length).toBe(0)
  })
  it('sets errors when trying to add an invalid new member', () => {
    const wrapper = setup()
    const addMemberButton = wrapper.find('div.panel button')
    addMemberButton.simulate('click')
    const blockInError = wrapper.find('.has-error')
    expect(blockInError.length).toBe(4)
    expect(blockInError.contains(<div className="help-block">obligatoire</div>)).toBe(true)
  })
  it('allows to add a new team member', () => {
    const newMember = {
      name: 'testName',
      firstname: 'testFirstname',
      role: 'testRole',
      diploma: 'testDiploma'
    }
    const wrapper = setup(newMember)
    const addMemberButton = wrapper.find('div.panel button')
    addMemberButton.simulate('click')
    expect(
      wrapper.contains(
        <tr>
          <td>{newMember.firstname}</td>
          <td>{newMember.name}</td>
          <td>{newMember.role}</td>
          <td>{newMember.diploma}</td>
        </tr>
      )
    ).toBe(true)
  })
})