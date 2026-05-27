export type TflStation = {
  id: string
  name: string
  modes: string[]
}

export type TflArrival = {
  id: string
  lineName: string
  platformName: string
  destinationName: string
  direction: string
  timeToStation: number
  expectedArrival: string
}
