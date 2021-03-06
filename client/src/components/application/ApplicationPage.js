import React, { PropTypes } from 'react'
import toastr from 'toastr'
import Multistep from '../common/MultiStep'
import SavePage from './Save/SavePage'
import ProjectPage from './Project/ProjectPage'
import TeamPage from './Team/TeamPage'
import ContactPage from './Contact/ContactPage'
import PepitePage from './Pepite/PepitePage'
import SendPage from './Send/SendPage'
import CareerPage from './Career/CareerPage'
import ProfilePage from './Profile/ProfilePage'
import { Modal, Button } from 'react-bootstrap'
import '../../styles/apply-form.css'
import { isEmptyObject } from '../common/validationHelper'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as errorsActions from '../../actions/errorsActions'
import * as applicationActions from '../../actions/applicationActions'
import * as pepiteListActions from '../../actions/pepiteListActions'

class ApplicationPage extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      isSaveShown: false
    }
    this.getSteps = this.getSteps.bind(this)
    this.closeSave = this.closeSave.bind(this)
    this.openSave = this.openSave.bind(this)
    this.canNavigate = this.canNavigate.bind(this)
  }

  componentDidMount() {
    if (this.props.applicationId) {
      this.props.applicationActions.loadApplication(this.props.applicationId).catch((err) => {
        toastr.error(err)
      })
    }
    this.props.pepiteListActions.loadPepiteList()
  }

  openSave(event) {
    event.preventDefault()
    if (this.props.actions.validateContact()) {
      this.props.applicationActions.saveApplication()
        .then((application) => {
          browserHistory.replace(`/application/${application.id}`)
          this.setState({ isSaveShown: true })
        })
        .catch((err) => {
          toastr.error(err)
        })
    } else {
      toastr.error("Pour sauvegarder, 'Mes Informations' doit être complet et valide")
    }
  }

  closeSave() {
    this.setState({ isSaveShown: false })
  }

  hasError(componentName) {
    return !isEmptyObject(this.props.errors[componentName])
  }

  getSteps() {
    return ([
      { name: 'Mes Infos', title: 'Mes Informations', component: <ContactPage />, hasError: this.hasError('contact') },
      { name: 'Mon Équipe', title: 'Mon Équipe', component: <TeamPage />, hasError: this.hasError('team') },
      { name: 'Mon Projet', title: 'Mon Projet', component: <ProjectPage />, hasError: this.hasError('project') },
      { name: 'Mon PEPITE', title: 'Mon PEPITE', component: <PepitePage />, hasError: this.hasError('pepite') },
      { name: 'Mon Parcours', title: 'Mon Parcours', component: <CareerPage />, hasError: this.hasError('bac') || this.hasError('diploma') || this.hasError('tutor') },
      { name: 'Mon Profil', title: 'Mon Profil', component: <ProfilePage />, hasError: this.hasError('profile') },
      { name: 'Envoi', title: 'Envoi', component: <SendPage /> }]
    )
  }

  canNavigate(stepIndex) {
    if (stepIndex == 0) {
      const isContactValid = this.props.actions.validateContact()
      if (!isContactValid) {
        toastr.error("Avant de continuer, 'Mes Informations' doit être complet et valide")
      }
      return isContactValid
    }
    return true
  }

  render() {
    return (
      <div>
        <Multistep steps={this.getSteps()} save={this.openSave} canNavigate={this.canNavigate} />
        <Modal show={this.state.isSaveShown} onHide={this.closeSave}>
          <Modal.Header>
            <Modal.Title>Candidature sauvegardée</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <SavePage />
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="info" onClick={this.closeSave}>Revenir à ma candidature</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}


function mapStateToProps(state, ownProps) {
  return {
    errors: state.errors,
    applicationId: ownProps.params.id
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(errorsActions, dispatch),
    applicationActions: bindActionCreators(applicationActions, dispatch),
    pepiteListActions: bindActionCreators(pepiteListActions, dispatch)
  }
}

ApplicationPage.propTypes = {
  actions: PropTypes.object.isRequired,
  applicationActions: PropTypes.object.isRequired,
  pepiteListActions: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  applicationId: PropTypes.string
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationPage)
