import React, { PropTypes } from 'react'
import { FormGroup, ControlLabel, FormControl, Radio, HelpBlock, Panel } from 'react-bootstrap'
import RadioGroup from '../../common/RadioGroup'
import ValidatedFormControl from '../../common/ValidatedFormControl'
import RegionSelect from './RegionSelect'
import EstablishmentSelect from './EstablishmentSelect'
import PepiteSelect from './PepiteSelect'
import NextCommittee from './NextCommittee'

const PepiteForm = ({pepite, contact, errors, onChange, onEstablishmentChange, regions}) => {
  return (
    <form>
      <RegionSelect
        selectedRegion={pepite.region}
        onChange={onChange}
        errors={errors} />
      <EstablishmentSelect
        selectedRegion={pepite.region}
        selectedEstablishment={pepite.establishment}
        isStudent={contact.situation == 'student'}
        onEstablishementChange={onEstablishmentChange}
        errors={errors} />
      <PepiteSelect
        selectedRegion={pepite.region}
        selectedPepite={pepite.pepite}
        onChange={onChange}
        errors={errors} />
      <NextCommittee pepiteId={pepite.pepite} />
      <FormGroup className="required">
        <ControlLabel>Je demande un accès à l'espace de coworking PEPITE (selon disponibilité)</ControlLabel>
        <RadioGroup name="askCoworking" onChange={onChange} selectedValue={pepite.askCoworking} error={errors.askCoworking}>
          <Radio value="true">oui</Radio>
          <Radio value="false">non</Radio>
        </RadioGroup>
      </FormGroup>
    </form>
  )
}

PepiteForm.propTypes = {
  pepite: PropTypes.object.isRequired,
  contact: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onEstablishmentChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
  regions: PropTypes.array.isRequired
}

export default PepiteForm
