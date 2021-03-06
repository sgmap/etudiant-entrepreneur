const supertest = require('supertest')
const Server = require('../../server')
const ApplicationModel = require('../application.model')
const applicationData = require('./application.seed')
const applicationOtherData = require('./application.other.seed')
const expect = require('expect')
const qs = require('qs')
const nodemailerMock = require('nodemailer-mock')

const authHelper = require('../../lib/testUtils/authHelper')

describe('api: application', () => {
  let app

  before(() => {
    app = new Server({ isTest: true, mailer: nodemailerMock }).getApp()
  })

  afterEach(() => {
    nodemailerMock.mock.reset()
  })

  describe('When requesting /api/application/ping', () => {
    it('should return pong', (done) => {
      supertest(app)
        .get('/api/application/ping')
        .expect(200, '"pong"', done)
    })
  })

  describe('When requesting a bad route', () => {
    it('should return a 404 not found error', (done) => {
      supertest(app)
        .get('/api/not-existing')
        .expect('Content-Type', /json/)
        .expect(404, done)
    })
  })

  describe('When requesting /api/application/ping', () => {
    it('should return pong', (done) => {
      supertest(app)
        .get('/api/application/ping')
        .expect(200, '"pong"', done)
    })
  })

  describe('When requesting /api/application/send', () => {
    it('should give valid id', (done) => {
      supertest(app)
        .put('/api/application/ddazdaz/send')
        .expect(404, done)
    })
  })

  describe('When retrieving an application', () => {
    const savedApplication = {
      '_id': '88e155dd6decfe105d313b63',
      'contact': {
        'schoolYear': 2016,
        'isRenew': 'true',
        'situation': 'student',
        'phone': '0643423333',
        'email': 'azza@test.com',
        'firstname': 'zaezae',
        'name': 'azezae'
      }
    }

    before((done) => {
      ApplicationModel.create(savedApplication, done)
    })

    after((done) => {
      ApplicationModel.remove(done)
    })

    it('should return a 404 if the id is invalid', (done) => {
      supertest(app)
        .get('/api/application/ddazdaz')
        .expect(404, done)
    })
    it('should return a 404 if the id does not exist', (done) => {
      supertest(app)
        .get('/api/application/0edaaf484d50ad693d5abee4')
        .expect(404, done)
    })
    it('should return the matching existing application', (done) => {
      supertest(app)
        .get(`/api/application/${savedApplication._id}`)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err)
          }
          expect(res.body).toContain(savedApplication)
          done()
        })
    })
  })

  describe('When saving an application', () => {
    const validApplication = {
      contact: {
        schoolYear: 2016,
        isRenew: 'true',
        situation: 'student',
        phone: '0643423333',
        email: 'azza@test.com',
        firstname: 'zaezae',
        name: 'azezae'
      }
    }

    const missingMailApplication = {
      contact: {
        schoolYear: 2016,
        isRenew: 'true',
        situation: 'student',
        phone: '0643423333',
        firstname: 'zaezae',
        name: 'azezae'
      }
    }

    it('should return the created application', (done) => {
      supertest(app)
        .post('/api/application')
        .send(validApplication)
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err)
          }
          expect(res.body).toContain(validApplication)
          const sentMail = nodemailerMock.mock.sentMail()
          expect(sentMail.length).toBe(1)
          done()
        })
    })

    it('should return a 400 if contact is missing information', (done) => {
      supertest(app)
        .post('/api/application', missingMailApplication)
        .expect(400, { error: 'bad_request', reason: 'La page \'Mes informations\' doit être correctement remplie' }, done)
    })
  })

  describe('When requesting /api/pepite/:id/application', () => {
    let validToken = {}

    before((done) => {
      ApplicationModel.insertMany(applicationData, () => authHelper.getToken(app, 'peel@univ-lorraine.fr', 'test', validToken, done))
    })

    after((done) => {
      ApplicationModel.remove(done)
    })

    describe('When an invalidtoken is provided', () => {
      it('should return a 401 error', (done) => {
        supertest(app)
          .get('/api/pepite/2/application')
          .expect(401, done)
      })
    })

    describe('When the PEPITE has not application', () => {
      it('should give an empty array', (done) => {
        supertest(app)
          .get('/api/pepite/2/application')
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            expect(res.body).toEqual([])
            return done()
          })
      })
    })

    describe('When the PEPITE has an application', () => {
      it('should give all applications made to the PEPITE', (done) => {
        supertest(app)
          .get('/api/pepite/1/application')
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            expect(res.body.length).toBe(1)
            done()
          })
      })
    })

    describe('When the PEPITE has several applications', () => {
      it('should give all applications made to the PEPITE', (done) => {
        supertest(app)
          .get('/api/pepite/3/application')
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            expect(res.body.length).toBe(2)
            done()
          })
      })
    })
  })

  describe('When requesting /api/:id/application/send', () => {
    before((done) => {
      ApplicationModel.insertMany(applicationData, done)
    })

    after((done) => {
      ApplicationModel.remove(done)
    })

    describe('When the application does not exist', () => {
      it('should return a 404', (done) => {
        supertest(app)
          .put('/api/application/0edaaf484d50ad693d5abee4/send')
          .expect(404, done)
      })
    })

    describe('When the application has already been sent', () => {
      it('should return a 400', (done) => {
        supertest(app)
          .put('/api/application/58370910e221d30010165435/send')
          .expect(400, done)
      })
    })

    describe('When the application has been saved', () => {
      it('should return a 200', (done) => {
        supertest(app)
          .put('/api/application/9c9d6a6b832effc406059b15/send')
          .expect(200)
          .end((err) => {
            if (err) {
              return done(err)
            }
            const sentMail = nodemailerMock.mock.sentMail()
            expect(sentMail.length).toBe(3)
            return done()
          })
      })
    })

    describe('When the application has an invalid pepite number', () => {
      it('should return a 500', (done) => {
        supertest(app)
          .put('/api/application/74cb70adcf551b6ed54460bc/send')
          .expect(500)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            expect(res.body).toEqual({ error: 'internal_server_error', reason: 'Le PEPITE avec l\'id: 42 n\'existe pas' })
            return done()
          })
      })
    })
  })

  describe('When updating an applicationd', () => {
    before((done) => {
      ApplicationModel.insertMany(applicationData, done)
    })

    after((done) => {
      ApplicationModel.remove(done)
    })

    describe('When the application does not exist', () => {
      const application = {
        'project': {
          'name': '',
          'summary': 'aze',
          'type': 'retake',
          'site': '',
          'status': 'company',
          'blog': '',
          'facebook': '',
          'twitter': '',
          'siret': '',
          'activitySummary': 'azeaze',
          'stepSummary': 'azeaze',
          'sector': '9',
          'otherSector': '',
          'motiviation': 'azeaze',
          'linkedin': '',
          'team': [],
          'teamType': ''
        },
        'profile': {
          'gender': 'male',
          'situation': 'graduate',
          'nationality': 'AW',
          'motivation': 'azeaz',
          'isPartTime': 'true',
          'hasActivity': 'true',
          'activity': '',
          'isUnemployed': 'true',
          'isFreelance': 'true',
          'birthDate': '2016-11-08T11:00:00.000Z',
          'birthPlace': 'azeaz',
          'ine': '',
          'address': 'aze',
          'cp': 'aze',
          'city': 'azeaz',
          'country': 'AW',
          'twitter': '',
          'facebook': '',
          'linkedin': '',
          'viadeo': ''
        },
        'career': {
          'bac': {
            'isOriginal': 'true',
            'type': 'general',
            'country': 'AO',
            'year': '2002',
            'stream': '',
            'establishment': '&é\'&é',
            'city': '&é\'&é\''
          },
          'diploma': {
            'year': '2004-2005',
            'type': '5',
            'name': 'azeaze',
            'sector': '',
            'establishment': 'azeaz',
            'city': 'azea'
          },
          'tutor': {
            'name': 'arzeaz',
            'firstname': 'azeazeaz',
            'email': 'aeaze@zaeeazaz.com',
            'skill': 'azezaz',
            'replaceInternship': 'true',
            'replaceModule': 'true',
            'askYearOff': 'true'
          },
          'entrepreneurship': []
        },
        'pepite': {
          'region': '1',
          'establishment': 0,
          'pepite': '3',
          'askCoworking': 'true'
        },
        '_id': '9c9d6a6b832effc406059b15',
        '__v': 0,
        'sentDate': '2016-11-24T11:12:12.329Z',
        'status': 'saved',
        'contact': {
          'schoolYear': 2016,
          'isRenew': 'true',
          'situation': 'student',
          'phone': '0643333333',
          'email': 'test@test.com',
          'firstname': 'William',
          'name': 'Rimbeau'
        },
        'date': '2016-11-24T11:12:12.272Z'
      }

      it('should return a 404', (done) => {
        supertest(app)
          .put('/api/application/0edaaf484d50ad693d5abee4')
          .send(application)
          .expect(404, done)
      })
    })

    describe('When the application is valid', () => {
      describe('When application has saved status', () => {
        const newApplication = {
          'project': {
            'name': '',
            'summary': 'aze',
            'type': 'retake',
            'site': '',
            'status': 'company',
            'blog': '',
            'facebook': '',
            'twitter': '',
            'siret': '',
            'activitySummary': 'azeaze',
            'stepSummary': 'azeaze',
            'sector': '9',
            'otherSector': '',
            'motiviation': 'azeaze',
            'linkedin': '',
            'team': [],
            'teamType': ''
          },
          'profile': {
            'gender': 'male',
            'situation': 'graduate',
            'nationality': 'AW',
            'motivation': 'azeaz',
            'isPartTime': 'true',
            'hasActivity': 'true',
            'activity': '',
            'isUnemployed': 'true',
            'isFreelance': 'true',
            'birthDate': '2016-11-08T11:00:00.000Z',
            'birthPlace': 'azeaz',
            'ine': '',
            'address': 'aze',
            'cp': 'aze',
            'city': 'azeaz',
            'country': 'AW',
            'twitter': '',
            'facebook': '',
            'linkedin': '',
            'viadeo': ''
          },
          'career': {
            'bac': {
              'isOriginal': 'true',
              'type': 'general',
              'country': 'AO',
              'year': '2002',
              'stream': '',
              'establishment': '&é\'&é',
              'city': '&é\'&é\''
            },
            'diploma': {
              'year': '2004-2005',
              'type': '5',
              'name': 'azeaze',
              'sector': '',
              'establishment': 'azeaz',
              'city': 'azea'
            },
            'tutor': {
              'name': 'arzeaz',
              'firstname': 'azeazeaz',
              'email': 'aeaze@zaeeazaz.com',
              'skill': 'azezaz',
              'replaceInternship': 'true',
              'replaceModule': 'true',
              'askYearOff': 'true'
            },
            'entrepreneurship': []
          },
          'pepite': {
            'region': '1',
            'establishment': 0,
            'pepite': '3',
            'askCoworking': 'true'
          },
          '_id': '9c9d6a6b832effc406059b15',
          '__v': 0,
          'sentDate': '2016-11-24T11:12:12.329Z',
          'status': 'saved',
          'contact': {
            'schoolYear': 2016,
            'isRenew': 'true',
            'situation': 'student',
            'phone': '0643333333',
            'email': 'test@test.com',
            'firstname': 'William',
            'name': 'Rimbeau'
          },
          'date': '2016-11-24T11:12:12.272Z'
        }

        describe('When application PEPITE does not change', () => {

          it('should return a 200 with the updated application', (done) => {
            supertest(app)
              .put('/api/application/9c9d6a6b832effc406059b15')
              .send(newApplication)
              .expect(200)
              .end((err, res) => {
                if (err) {
                  return done(err)
                }
                expect(res.body).toContain(newApplication)
                return done()
              })
          })
        })

        describe('When application PEPITE does change', () => {
          newApplication.pepite.pepite = '10'
          let sentMail
          it('should return a 200 with the updated application', (done) => {
            supertest(app)
              .put('/api/application/9c9d6a6b832effc406059b15')
              .send(newApplication)
              .expect(200)
              .end((err, res) => {
                if (err) {
                  return done(err)
                }
                sentMail = nodemailerMock.mock.sentMail()
                expect(res.body).toContain(newApplication)
                return done()
              })
          })
          it('should not send any email', () => {
            expect(sentMail.length).toBe(0)
          })
        })
      })

      describe('When application has a sent status', () => {
        const newApplication = {
          'project': {
            'name': '',
            'summary': 'aze',
            'type': 'retake',
            'site': '',
            'status': 'company',
            'blog': '',
            'facebook': '',
            'twitter': '',
            'siret': '',
            'activitySummary': 'azeaze',
            'stepSummary': 'azeaze',
            'sector': '9',
            'otherSector': '',
            'motiviation': 'azeaze',
            'linkedin': '',
            'team': [],
            'teamType': ''
          },
          'profile': {
            'gender': 'male',
            'situation': 'graduate',
            'nationality': 'AW',
            'motivation': 'azeaz',
            'isPartTime': 'true',
            'hasActivity': 'true',
            'activity': '',
            'isUnemployed': 'true',
            'isFreelance': 'true',
            'birthDate': '2016-11-08T11:00:00.000Z',
            'birthPlace': 'azeaz',
            'ine': '',
            'address': 'aze',
            'cp': 'aze',
            'city': 'azeaz',
            'country': 'AW',
            'twitter': '',
            'facebook': '',
            'linkedin': '',
            'viadeo': ''
          },
          'career': {
            'bac': {
              'isOriginal': 'true',
              'type': 'general',
              'country': 'AO',
              'year': '2002',
              'stream': '',
              'establishment': '&é\'&é',
              'city': '&é\'&é\''
            },
            'diploma': {
              'year': '2004-2005',
              'type': '5',
              'name': 'azeaze',
              'sector': '',
              'establishment': 'azeaz',
              'city': 'azea'
            },
            'tutor': {
              'name': 'arzeaz',
              'firstname': 'azeazeaz',
              'email': 'aeaze@zaeeazaz.com',
              'skill': 'azezaz',
              'replaceInternship': 'true',
              'replaceModule': 'true',
              'askYearOff': 'true'
            },
            'entrepreneurship': []
          },
          'pepite': {
            'region': '1',
            'establishment': 0,
            'pepite': '3',
            'askCoworking': 'true'
          },
          '_id': '9c9d6a6b832effc406059b15',
          '__v': 0,
          'sentDate': '2016-11-24T11:12:12.329Z',
          'status': 'saved',
          'contact': {
            'schoolYear': 2016,
            'isRenew': 'true',
            'situation': 'student',
            'phone': '0643333333',
            'email': 'test@test.com',
            'firstname': 'William',
            'name': 'Rimbeau'
          },
          'date': '2016-11-24T11:12:12.272Z'
        }
        describe('When application PEPITE does not change', () => {
          let sentMail
          it('should return a 200 with the updated application', (done) => {
            supertest(app)
              .put('/api/application/9c9d6a6b832effc406059b15')
              .send(newApplication)
              .expect(200)
              .end((err, res) => {
                if (err) {
                  return done(err)
                }
                sentMail = nodemailerMock.mock.sentMail()
                expect(res.body).toContain(newApplication)
                return done()
              })
          })
          it('should not have sent any email', () => {
            expect(sentMail.length).toBe(0)
          })
        })

        describe('When application PEPITE does change', () => {
          describe('When PEPITE does exist', () => {
            describe('When application have saved status', () => {
              const changePepiteApplication = {
                'project': {
                  'name': '',
                  'summary': 'aze',
                  'type': 'retake',
                  'site': '',
                  'status': 'company',
                  'blog': '',
                  'facebook': '',
                  'twitter': '',
                  'siret': '',
                  'activitySummary': 'azeaze',
                  'stepSummary': 'azeaze',
                  'sector': '9',
                  'otherSector': '',
                  'motiviation': 'azeaze',
                  'linkedin': '',
                  'team': [],
                  'teamType': ''
                },
                'profile': {
                  'gender': 'male',
                  'situation': 'graduate',
                  'nationality': 'AW',
                  'motivation': 'azeaz',
                  'isPartTime': 'true',
                  'hasActivity': 'true',
                  'activity': '',
                  'isUnemployed': 'true',
                  'isFreelance': 'true',
                  'birthDate': '2016-11-08T11:00:00.000Z',
                  'birthPlace': 'azeaz',
                  'ine': '',
                  'address': 'aze',
                  'cp': 'aze',
                  'city': 'azeaz',
                  'country': 'AW',
                  'twitter': '',
                  'facebook': '',
                  'linkedin': '',
                  'viadeo': ''
                },
                'career': {
                  'bac': {
                    'isOriginal': 'true',
                    'type': 'general',
                    'country': 'AO',
                    'year': '2002',
                    'stream': '',
                    'establishment': '&é\'&é',
                    'city': '&é\'&é\''
                  },
                  'diploma': {
                    'year': '2004-2005',
                    'type': '5',
                    'name': 'azeaze',
                    'sector': '',
                    'establishment': 'azeaz',
                    'city': 'azea'
                  },
                  'tutor': {
                    'name': 'arzeaz',
                    'firstname': 'azeazeaz',
                    'email': 'aeaze@zaeeazaz.com',
                    'skill': 'azezaz',
                    'replaceInternship': 'true',
                    'replaceModule': 'true',
                    'askYearOff': 'true'
                  },
                  'entrepreneurship': []
                },
                'pepite': {
                  'region': '1',
                  'establishment': 0,
                  'pepite': '10',
                  'askCoworking': 'true'
                },
                '_id': '9c9d6a6b832effc406059b15',
                '__v': 0,
                'sentDate': '2016-11-24T11:12:12.329Z',
                'status': 'saved',
                'contact': {
                  'schoolYear': 2016,
                  'isRenew': 'true',
                  'situation': 'student',
                  'phone': '0643333333',
                  'email': 'test@test.com',
                  'firstname': 'William',
                  'name': 'Rimbeau'
                },
                'date': '2016-11-24T11:12:12.272Z'
              }
              let sentMail
              it('should return a 200 with the updated application', (done) => {
                supertest(app)
                  .put('/api/application/9c9d6a6b832effc406059b15')
                  .send(changePepiteApplication)
                  .expect(200)
                  .end((err, res) => {
                    if (err) {
                      return done(err)
                    }
                    sentMail = nodemailerMock.mock.sentMail()
                    expect(res.body).toContain(changePepiteApplication)
                    return done()
                  })
              })
              it('should not send any email', () => {
                expect(sentMail.length).toBe(0)
              })
            })

            describe('When application have sent status', () => {
              const changePepiteApplication = {
                'project': {
                  'name': '',
                  'summary': 'aze',
                  'type': 'retake',
                  'site': '',
                  'status': 'company',
                  'blog': '',
                  'facebook': '',
                  'twitter': '',
                  'siret': '',
                  'activitySummary': 'azeaze',
                  'stepSummary': 'azeaze',
                  'sector': '9',
                  'otherSector': '',
                  'motiviation': 'azeaze',
                  'linkedin': '',
                  'team': [],
                  'teamType': ''
                },
                'profile': {
                  'gender': 'male',
                  'situation': 'graduate',
                  'nationality': 'AW',
                  'motivation': 'azeaz',
                  'isPartTime': 'true',
                  'hasActivity': 'true',
                  'activity': '',
                  'isUnemployed': 'true',
                  'isFreelance': 'true',
                  'birthDate': '2016-11-08T11:00:00.000Z',
                  'birthPlace': 'azeaz',
                  'ine': '',
                  'address': 'aze',
                  'cp': 'aze',
                  'city': 'azeaz',
                  'country': 'AW',
                  'twitter': '',
                  'facebook': '',
                  'linkedin': '',
                  'viadeo': ''
                },
                'career': {
                  'bac': {
                    'isOriginal': 'true',
                    'type': 'general',
                    'country': 'AO',
                    'year': '2002',
                    'stream': '',
                    'establishment': '&é\'&é',
                    'city': '&é\'&é\''
                  },
                  'diploma': {
                    'year': '2004-2005',
                    'type': '5',
                    'name': 'azeaze',
                    'sector': '',
                    'establishment': 'azeaz',
                    'city': 'azea'
                  },
                  'tutor': {
                    'name': 'arzeaz',
                    'firstname': 'azeazeaz',
                    'email': 'aeaze@zaeeazaz.com',
                    'skill': 'azezaz',
                    'replaceInternship': 'true',
                    'replaceModule': 'true',
                    'askYearOff': 'true'
                  },
                  'entrepreneurship': []
                },
                'pepite': {
                  'region': '1',
                  'establishment': 0,
                  'pepite': '10',
                  'askCoworking': 'true'
                },
                '_id': '58370910e221d30010165435',
                '__v': 0,
                'sentDate': '2016-11-24T11:12:12.329Z',
                'status': 'sent',
                'contact': {
                  'schoolYear': 2016,
                  'isRenew': 'true',
                  'situation': 'student',
                  'phone': '0643333333',
                  'email': 'test2@test.com',
                  'firstname': 'Romain',
                  'name': 'Villon'
                },
                'date': '2016-11-24T11:12:12.272Z'
              }
              let sentMail
              it('should return a 200 with the updated application', (done) => {
                supertest(app)
                  .put('/api/application/58370910e221d30010165435')
                  .send(changePepiteApplication)
                  .expect(200)
                  .end((err, res) => {
                    if (err) {
                      return done(err)
                    }
                    sentMail = nodemailerMock.mock.sentMail()
                    expect(res.body).toContain(changePepiteApplication)
                    return done()
                  })
              })
              it('should have sent 3 emails', () => {
                expect(sentMail.length).toBe(3)
              })
            })
          })

          describe('When PEPITE does not exist', () => {

            it('should return an error', (done) => {
              const invalidPepiteApplication = {
                'project': {
                  'name': '',
                  'summary': 'aze',
                  'type': 'retake',
                  'site': '',
                  'status': 'company',
                  'blog': '',
                  'facebook': '',
                  'twitter': '',
                  'siret': '',
                  'activitySummary': 'azeaze',
                  'stepSummary': 'azeaze',
                  'sector': '9',
                  'otherSector': '',
                  'motiviation': 'azeaze',
                  'linkedin': '',
                  'team': [],
                  'teamType': ''
                },
                'profile': {
                  'gender': 'male',
                  'situation': 'graduate',
                  'nationality': 'AW',
                  'motivation': 'azeaz',
                  'isPartTime': 'true',
                  'hasActivity': 'true',
                  'activity': '',
                  'isUnemployed': 'true',
                  'isFreelance': 'true',
                  'birthDate': '2016-11-08T11:00:00.000Z',
                  'birthPlace': 'azeaz',
                  'ine': '',
                  'address': 'aze',
                  'cp': 'aze',
                  'city': 'azeaz',
                  'country': 'AW',
                  'twitter': '',
                  'facebook': '',
                  'linkedin': '',
                  'viadeo': ''
                },
                'career': {
                  'bac': {
                    'isOriginal': 'true',
                    'type': 'general',
                    'country': 'AO',
                    'year': '2002',
                    'stream': '',
                    'establishment': '&é\'&é',
                    'city': '&é\'&é\''
                  },
                  'diploma': {
                    'year': '2004-2005',
                    'type': '5',
                    'name': 'azeaze',
                    'sector': '',
                    'establishment': 'azeaz',
                    'city': 'azea'
                  },
                  'tutor': {
                    'name': 'arzeaz',
                    'firstname': 'azeazeaz',
                    'email': 'aeaze@zaeeazaz.com',
                    'skill': 'azezaz',
                    'replaceInternship': 'true',
                    'replaceModule': 'true',
                    'askYearOff': 'true'
                  },
                  'entrepreneurship': []
                },
                'pepite': {
                  'region': '1',
                  'establishment': 0,
                  'pepite': '42',
                  'askCoworking': 'true'
                },
                '_id': '58370910e221d30010165435',
                '__v': 0,
                'sentDate': '2016-11-24T11:12:12.329Z',
                'status': 'sent',
                'contact': {
                  'schoolYear': 2016,
                  'isRenew': 'true',
                  'situation': 'student',
                  'phone': '0643333333',
                  'email': 'test2@test.com',
                  'firstname': 'Romain',
                  'name': 'Villon'
                },
                'date': '2016-11-24T11:12:12.272Z'
              }
              supertest(app)
                .put('/api/application/58370910e221d30010165435')
                .send(invalidPepiteApplication)
                .expect(400)
                .end((err, res) => {
                  if (err) {
                    return done(err)
                  }
                  expect(res.body).toEqual({ error: 'bad_request', reason: 'Le PEPITE avec l\'id: 42 n\'existe pas' })
                  return done()
                })
            })
          })
        })
      })
    })
  })

  describe('When requesting /api/application/:id/certificate', () => {
    let validToken = {}

    before((done) => {
      ApplicationModel.insertMany(applicationData, () => authHelper.getToken(app, 'peel@univ-lorraine.fr', 'test', validToken, done))
    })

    after((done) => {
      ApplicationModel.remove(done)
    })

    describe('When an invalidtoken is provided', () => {
      it('should return a 401 error', (done) => {
        supertest(app)
          .get('/api/application/someId/certificate?access_token=invalidToken')
          .expect(401, done)
      })
    })

    describe('When the application does not exist', () => {
      it('should give a 404 erorr', () => {
        supertest(app)
          .get(`/api/application/someId/certificate?access_token=${validToken.token}`)
          .expect(404)
      })
    })

    describe('When the PEPITE has an application', () => {
      it('should give the applicant attestation', (done) => {
        supertest(app)
          .get(`/api/application/58370910e221d30010165435/certificate?access_token=${validToken.token}`)
          .expect(200)
          .end((err) => {
            if (err) {
              return done(err)
            }
            done()
          })
      })
    })
  })

  describe('When requesting /api/application/:id/other', () => {
    let validToken = {}

    before((done) => {
      ApplicationModel.insertMany(applicationOtherData, () => authHelper.getToken(app, 'peel@univ-lorraine.fr', 'test', validToken, done))
    })

    after((done) => {
      ApplicationModel.remove(done)
    })

    describe('When an invalidtoken is provided', () => {
      it('should return a 401 error', (done) => {
        supertest(app)
          .get('/api/application/2/other')
          .expect(401, done)
      })
    })

    describe('When the application does not exist', () => {
      it('should give a 404', (done) => {
        supertest(app)
          .get('/api/application/57ff4d302c0c5c0010daf043/other')
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(404, done)
      })
    })

    describe('When there is no application with the same email', () => {
      it('should give an empty array', (done) => {
        supertest(app)
          .get('/api/application/58370910e221d30010165435/other')
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            expect(res.body).toEqual([])
            return done()
          })
      })
    })

    describe('When there is several applications with the same email', () => {
      it('should give all applications with the same email withing the same school year', (done) => {
        const acceptedStatus = {
          status: 'accepted'
        }
        const sentStatus = {
          status: 'sent'
        }
        const pepiteKey = 'pepite'
        const sentDateKey = 'sentDate'

        supertest(app)
          .get('/api/application/9c9d6a6b832effc406059b15/other')
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            expect(res.body.length).toBe(2)
            expect(res.body[0]).toIncludeKey(pepiteKey)
            expect(res.body[0]).toIncludeKey(sentDateKey)
            expect(res.body[0]).toInclude(acceptedStatus)
            expect(res.body[1]).toIncludeKey(pepiteKey)
            expect(res.body[1]).toIncludeKey(sentDateKey)
            expect(res.body[1]).toInclude(sentStatus)
            done()
          })
      })
    })
  })

  describe('When requesting /api/application?filter', () => {
    let validToken = {}

    before((done) => {
      ApplicationModel.insertMany(applicationData, () => authHelper.getToken(app, 'contact@etudiant-entrepreneur.beta.gouv.fr', 'test', validToken, done))
    })

    after((done) => {
      ApplicationModel.remove(done)
    })

    describe('When an invalidtoken is provided', () => {
      it('should return a 401 error', (done) => {
        supertest(app)
          .get('/api/application')
          .expect(401, done)
      })
    })

    describe('When no filter is provided', () => {
      describe('When no page is given', () => {
        it('should give all applications', (done) => {
          supertest(app)
            .get('/api/application')
            .set('Authorization', `Bearer ${validToken.token}`)
            .expect(200)
            .end((err, res) => {
              if (err) {
                return done(err)
              }
              expect(res.body.length).toEqual(4)
              return done()
            })
        })
      })

      describe('When first page is asked', () => {
        it('should give all applications', (done) => {
          supertest(app)
            .get('/api/application?page=1')
            .set('Authorization', `Bearer ${validToken.token}`)
            .expect(200)
            .end((err, res) => {
              if (err) {
                return done(err)
              }
              expect(res.body.length).toEqual(4)
              return done()
            })
        })
      })

      describe('When page greater than maxPage is asked', () => {
        it('should give a bad request', () => {
          supertest(app)
            .get('/api/application?page=2')
            .set('Authorization', `Bearer ${validToken.token}`)
            .expect(400)
        })
      })
    })

    describe('When filter is on PEPITE id', () => {
      it('should give all applications made to the PEPITE', (done) => {
        const filter = {
          pepite: 3
        }
        supertest(app)
          .get(`/api/application?${qs.stringify({ filter }, { encode: false })}`)
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(200)
          .expect('Content-Range', 2)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            expect(res.body.length).toBe(2)
            done()
          })
      })
    })

    describe('When filter is on email', () => {
      it('should give all applications containing the filter', (done) => {
        const filter = {
          email: 'test2'
        }
        supertest(app)
          .get(`/api/application?${qs.stringify({ filter }, { encode: false })}`)
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(200)
          .expect('Content-Range', 1)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            expect(res.body.length).toBe(1)
            done()
          })
      })
    })

    describe('When filter is on name', () => {
      it('should give all applications containing the filter', (done) => {
        const filter = {
          name: 'vil'
        }
        supertest(app)
          .get(`/api/application?${qs.stringify({ filter }, { encode: false })}`)
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(200)
          .expect('Content-Range', 1)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            expect(res.body.length).toBe(1)
            done()
          })
      })
    })

    describe('When filter is on status', () => {
      it('should give all applications containing the filter', (done) => {
        const filter = {
          status: 'saved'
        }
        supertest(app)
          .get(`/api/application?${qs.stringify({ filter }, { encode: false })}`)
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(200)
          .expect('Content-Range', 2)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            expect(res.body.length).toBe(2)
            done()
          })
      })
    })

    describe('When filter is on establishment', () => {
      it('should give all applications containing the filter', (done) => {
        const filter = {
          establishment: 'école'
        }
        supertest(app)
          .get(`/api/application?${qs.stringify({ filter }, { encode: false })}`)
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(200)
          .expect('Content-Range', 1)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            expect(res.body.length).toBe(1)
            done()
          })
      })
    })
  })

  describe('When requesting /api/application/drop', () => {
    let validToken = {}

    before((done) => {
      ApplicationModel.insertMany(applicationData, () => authHelper.getToken(app, 'peel@univ-lorraine.fr', 'test', validToken, done))
    })

    after((done) => {
      ApplicationModel.remove(done)
    })

    describe('When an invalid token is provided', () => {
      it('should return a 401 error', (done) => {
        supertest(app)
          .put('/api/application/58370910e221d30010165435/drop')
          .set('Authorization', 'Bearer invalidToken')
          .expect(401, done)
      })
    })

    describe('When the application does not exist', () => {
      it('should give a 404 erorr', (done) => {
        supertest(app)
          .put('/api/application/someId/drop')
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(404, done)
      })
    })

    describe('When the application does exist', () => {
      it('change application status to dropped', (done) => {
        supertest(app)
          .put('/api/application/58370910e221d30010165435/drop')
          .set('Authorization', `Bearer ${validToken.token}`)
          .expect(200)
          .end((err, res) => {
            if (err) {
              return done(err)
            }
            expect(res.body.status).toBe('dropped')
            done()
          })
      })
    })
  })
})
