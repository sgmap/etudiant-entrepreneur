import React, {PropTypes} from 'react'
import { FormGroup, ControlLabel, FormControl, Radio, HelpBlock, Panel } from 'react-bootstrap'
import Datetime from 'react-datetime'
import RadioGroup from '../../common/RadioGroup'
import ValidatedFormControl from '../../common/ValidatedFormControl'

const ProfileForm = ({profile, contact, errors, onChange, onDateChange}) => {
  return (
    <form>
      <p>Mon Profil</p>
      <FormGroup className="required">
        <ControlLabel>Genre</ControlLabel>
        <RadioGroup name="gender" onChange={onChange} selectedValue={profile.gender}>
          <Radio value="male">Homme</Radio>
          <Radio value="female">Femme</Radio>
        </RadioGroup>
      </FormGroup>
      <FormGroup className={(contact.situation == 'student') ? 'required' : 'required hidden'}>
        <ControlLabel>Étudiant en 2016 :</ControlLabel>
        <RadioGroup name="situation" onChange={onChange} selectedValue={profile.situation}>
          <Radio value="graduate">Je fini mes études avant décembre 2016</Radio>
          <Radio value="student">Je serai étudiant·e toute l'année universitaire 2016-2017</Radio>
        </RadioGroup>
      </FormGroup>
      <FormGroup className="required">
        <ControlLabel>Date de naissance</ControlLabel>
        <Datetime value={profile.birthDate} locale="fr-fr" timeFormat={false} inputProps={{onChange: () => {}}} onChange={onDateChange}/>
      </FormGroup>
      <FormGroup className="required">
        <ControlLabel>Lieu de naissance</ControlLabel>
        <ValidatedFormControl name="birthPlace" type="text" placeholder="ville de naissance" onChange={onChange} value={profile.birthPlace} error={errors.birthPlace}/>
      </FormGroup>
      <FormGroup className="required">
        <ControlLabel>Nationalité</ControlLabel>
        <RadioGroup name="nationality" onChange={onChange} selectedValue={profile.nationality}>
          <Radio value="fr">française</Radio>
          <Radio value="other">étrangère</Radio>
        </RadioGroup>
      </FormGroup>
      <FormGroup className={(profile.nationality == 'other') ? 'required' : 'required hidden'}>
        <ControlLabel>Précisez</ControlLabel>
        <ValidatedFormControl name="otherNationality" type="text" placeholder="nationalité" onChange={onChange} value={profile.otherNationality} error={errors.otherNationality}/>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Identifiant national étudiant (INE)</ControlLabel>
        <ValidatedFormControl name="ine" type="text" placeholder="11 caractères" onChange={onChange} value={profile.ine} error={errors.ine}/>
        <HelpBlock>identifiant ou numéro national étudiant unique présent sur ma carte d’étudiant·e ou mes relevés de notes.</HelpBlock>
      </FormGroup>
      <FormGroup className="required">
        <ControlLabel>Motivation à candidater au Statut étudiant-entrepneur</ControlLabel>
        <ValidatedFormControl name="motivation" rows="5" componentClass="textarea" placeholder="vos motivations" onChange={onChange} value={profile.motivation} error={errors.motivation}/>
      </FormGroup>
      <Panel header="Mes coordonnées">
        <FormGroup className="required">
          <ControlLabel>Adresse postale</ControlLabel>
          <ValidatedFormControl name="address" type="text" placeholder="Adresse" onChange={onChange} value={profile.address} error={errors.address}/>
        </FormGroup>
        <FormGroup className="required">
          <ControlLabel>Code postal</ControlLabel>
          <ValidatedFormControl name="cp" type="text" placeholder="Code postal" onChange={onChange} value={profile.cp} error={errors.cp}/>
        </FormGroup>
        <FormGroup className="required">
          <ControlLabel>Ville</ControlLabel>
          <ValidatedFormControl name="city" type="text" placeholder="Ville" onChange={onChange} value={profile.city} error={errors.city}/>
        </FormGroup>
        <FormGroup className="required">
          <ControlLabel>Pays</ControlLabel>
          <ValidatedFormControl name="country" type="text" placeholder="Pays" onChange={onChange} value={profile.country} error={errors.country}/>
        </FormGroup>
      </Panel>
      <Panel header="Mon activité">
        <FormGroup className="required">
          <ControlLabel>J'occupe actuellement une activité professionnelle à temps complet ou partiel</ControlLabel>
          <RadioGroup name="hasActivity" onChange={onChange} selectedValue={profile.hasActivity}>
            <Radio value="true">oui</Radio>
            <Radio value="false">non</Radio>
          </RadioGroup>
        </FormGroup>
        <FormGroup className={(profile.hasActivity == 'true') ? '' : 'hidden'}>
          <ControlLabel>Activité</ControlLabel>
          <ValidatedFormControl name="activity" type="text" placeholder="nature de l'activité (informatique, droit...)" onChange={onChange} value={profile.activity} error={errors.activity}/>
        </FormGroup>
        <FormGroup className="required">
          <ControlLabel>Je suis à la recherche d'un emploi</ControlLabel>
          <RadioGroup name="isUnemployed" onChange={onChange} selectedValue={profile.isUnemployed}>
            <Radio value="true">oui</Radio>
            <Radio value="false">non</Radio>
          </RadioGroup>
        </FormGroup>
        <Panel className={(profile.isUnemployed == 'true') ? '' : 'hidden'}>
          <div>Si tu es actuellement demandeur d'emploi, pense à intégrer le D2E dans <a target="_blank" href="https://www.service-public.fr/particuliers/vosdroits/F14926">ton projet personalisé de retour à l'emploi</a> avec ton conseiller Pôle emploi.</div>
        </Panel>
        <FormGroup className="required">
          <ControlLabel>Je suis autoentrepreneur·e</ControlLabel>
          <RadioGroup name="isFreelance" onChange={onChange} selectedValue={profile.isFreelance}>
            <Radio value="true">oui</Radio>
            <Radio value="false">non</Radio>
          </RadioGroup>
        </FormGroup>
        <FormGroup className="required">
          <ControlLabel>Je poursui une formation en alternance</ControlLabel>
          <RadioGroup name="isPartTime" onChange={onChange} selectedValue={profile.isPartTime}>
            <Radio value="true">oui</Radio>
            <Radio value="false">non</Radio>
          </RadioGroup>
        </FormGroup>
      </Panel>
      <Panel header="Mes réseaux sociaux">
        <FormGroup>
          <ControlLabel>mon twitter</ControlLabel>
          <ValidatedFormControl name="twitter" type="url" placeholder="twitter" onChange={onChange} value={profile.twitter} error={errors.twitter}/>
        </FormGroup>
        <FormGroup>
          <ControlLabel>mon facebook</ControlLabel>
          <ValidatedFormControl name="facebook" type="url" placeholder="facebook" onChange={onChange} value={profile.facebook} error={errors.facebook}/>
        </FormGroup>
        <FormGroup>
          <ControlLabel>mon linkedin</ControlLabel>
          <ValidatedFormControl name="linkedin" type="url" placeholder="linkedin" onChange={onChange} value={profile.linkedin} error={errors.linkedin}/>
        </FormGroup>
        <FormGroup>
          <ControlLabel>mon viadeo</ControlLabel>
          <ValidatedFormControl name="viadeo" type="url" placeholder="viadeo" onChange={onChange} value={profile.viadeo} error={errors.viadeo}/>
        </FormGroup>
      </Panel>
    </form>
  )
}

ProfileForm.propTypes = {
  profile: PropTypes.object.isRequired,
  contact: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  errors: PropTypes.object
}

export default ProfileForm
