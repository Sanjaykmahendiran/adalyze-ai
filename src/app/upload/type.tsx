export interface Country {
    id: string
    name: string
    iso3: string
    numeric_code: string
    iso2: string
    phonecode: string
    region_id: string
    subregion_id: string
    created_at: string
    updated_at: string
    flag: string
}

export interface State {
    id: string
    name: string
    country_id: string
    country_code: string
    fips_code: string
    iso2: string
    type: string
    latitude: string
    longitude: string
    created_at: string
    updated_at: string
    flag: string
    wikiDataId: string
}

export interface TargetInfo {
    platform: string
    industry: string
    age: string
    gender: string
    country: string
    state: string
    countryName?: string
    stateName?: string
}