import { dosingPumpsLoaded, dosingPumpScheduleUpdated, dosingPumpCalibrated, fetchDosingPumps, createDosingPump, deleteDosingPump, updateDosingPumpSchedule, calibrateDosingPump } from './doser'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import 'isomorphic-fetch'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('doser actions', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })

  it('dosingPumpsLoaded', () => {
    expect(dosingPumpsLoaded({}).type).toEqual('DOSING_PUMPS_LOADED')
  })

  it('dosingPumpScheduleUpdated', () => {
    expect(dosingPumpScheduleUpdated({}).type).toEqual('DOSING_PUMP_SCHEDULE_UPDATED')
  })

  it('dosingPumpCalibrated', () => {
    expect(dosingPumpCalibrated({}).type).toEqual('DOSING_PUMP_CALIBRATED')
  })

  it('fetchDosingPumps', () => {
    fetchMock.getOnce('/api/doser/pumps', {})
    const store = mockStore()
    return store.dispatch(fetchDosingPumps()).then(() => {
      expect(store.getActions()).toEqual([dosingPumpsLoaded({})])
    })
  })

  it('createDosingPump', () => {
    fetchMock.putOnce('/api/doser/pumps', {})
    fetchMock.getOnce('/api/doser/pumps', {})
    const store = mockStore()
    return store.dispatch(createDosingPump()).then(() => {
      expect(store.getActions()).toEqual([dosingPumpsLoaded({})])
    })
  })

  it('deleteDosingPump', () => {
    fetchMock.deleteOnce('/api/doser/pumps/1', {})
    fetchMock.getOnce('/api/doser/pumps', {})
    const store = mockStore()
    return store.dispatch(deleteDosingPump('1')).then(() => {
      expect(store.getActions()).toEqual([dosingPumpsLoaded({})])
    })
  })

  it('updateDosingPumpSchedule', () => {
    fetchMock.postOnce('/api/doser/pumps/1/schedule', {})
    const store = mockStore()
    return store.dispatch(updateDosingPumpSchedule('1', {})).then(() => {
      expect(store.getActions()).toEqual([dosingPumpScheduleUpdated({})])
    })
  })

  it('calibrateDosingPump', () => {
    fetchMock.postOnce('/api/doser/pumps/1/calibrate', {})
    const store = mockStore()
    return store.dispatch(calibrateDosingPump('1', {})).then(() => {
      expect(store.getActions()).toEqual([dosingPumpCalibrated({})])
    })
  })
})
