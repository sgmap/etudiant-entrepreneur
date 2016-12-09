import React, { PropTypes } from 'react'
import { Glyphicon } from 'react-bootstrap'
import GraduationLabel from './GraduationLabel'

const PepiteApplicantRow = ({application}) => {
  return (
    <tr>
      <td>{application.contact.firstname}</td>
      <td>{application.contact.name}</td>
      <td>{application.contact.email}</td>
      <td>{application.career.diploma.establishment}</td>
      <td><GraduationLabel application={application}/></td>
      <td><a className="btn btn-info btn-xs" target="_blank" href={`/application/${application._id}`}><Glyphicon glyph="share-alt" /></a></td>
    </tr>
  )
}

PepiteApplicantRow.propTypes = {
  application: PropTypes.object.isRequired,
}

export default PepiteApplicantRow
