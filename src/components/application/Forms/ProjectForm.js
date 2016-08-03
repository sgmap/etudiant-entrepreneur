import React, {PropTypes} from 'react'
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap'

const ProjectForm = ({project, onChange}) => {
  return (
    <form>
      <h1>Mon Projet</h1>
      <FormGroup>
        <ControlLabel>Nom de mon projet</ControlLabel>
        <FormControl type="text" placeholder="Projet" onChange={onChange} value={project.value}/>
        <HelpBlock>Le nom n'est pas obligatoire.</HelpBlock>
      </FormGroup>
    </form>
  )
}

ProjectForm.propTypes = {
  project: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
}

export default ProjectForm
