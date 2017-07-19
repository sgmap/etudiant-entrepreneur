import React, { PropTypes } from 'react'
import TimeSinceControl from '../pepite/Applicant/TimeSinceControl'
import StatusLabel from '../pepite/Applicant/StatusLabel'

const ApplicationRow = ({ application, pepites }) => {
  const pepiteName = (application.pepite &&
    application.pepite.pepite &&
    application.pepite.pepite != '0' &&
    Number(application.pepite.pepite) < pepites.length) ?
  pepites[Number(application.pepite.pepite) - 1].name : '-'

  return (
    <tr>
      <td><TimeSinceControl textDate={application.sentDate}/></td>
      <td>{application.contact.schoolYear}</td>
      <td>{application.contact.email}</td>
      <td>{application.contact.name}</td>
      <td>{application.contact.firstname}</td>
      <td>{application.career.diploma.establishment}</td>
      <td>{pepiteName}</td>
      <td><StatusLabel status={application.status}/></td>
    </tr>
  )
}

ApplicationRow.propTypes = {
  application: PropTypes.object.isRequired,
  pepites: PropTypes.array.isRequired,
}

export default ApplicationRow
