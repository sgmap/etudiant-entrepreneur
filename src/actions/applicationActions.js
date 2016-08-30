import ApplicationApi from '../api/mockApplicationApi'
import {loadContactSuccess} from './contactActions'
import {loadProjectSuccess} from './projectActions'
import {loadPepiteSuccess} from './pepiteActions'
import * as types from './actionTypes'

export function loadApplicationSuccess(application) {
  return { type: types.LOAD_APPLICATION_SUCCESS, application }
}

export function updateApplicationSuccess(application) {
  return { type: types.UPDATE_APPLICATION_SUCCESS, application }
}

export function loadApplication(id) {
  return dispatch => {
    return ApplicationApi.getApplication(id).then(application => {
      dispatch(loadApplicationSuccess(application))
      dispatch(loadContactSuccess(application.contact))
      dispatch(loadProjectSuccess(application.project))
      dispatch(loadPepiteSuccess(application.pepite))
    }).catch(error => {
      throw (error)
    })
  }
}

export function saveApplication() {
  return (dispatch, getState) => {
    const {applicationId, project, contact} = getState()
    return ApplicationApi.saveApplication(Object.assign({ applicationId, project, contact })).then(application => {
      dispatch(updateApplicationSuccess(application))
    }).catch(error => {
      throw (error)
    })
  }
}
