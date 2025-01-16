import { OpenAIService } from '../modules/OpenAIService';
import { verifyResults } from '../utils/verifyResults';

import type { ChatCompletion } from 'openai/resources/chat/completions';

const BARBARA_NOTE_URL = 'https://centrala.ag3nts.org/dane/barbara.txt';
const LOOKING_NAME = 'BARBARA';

const fetchData = async (url: string, body: Record<string, any>) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apikey: process.env.AI_DEVS_API_KEY, ...body }),
    }).then((response) => response.json());

    return response.message.split(' ');
};

const extractNamesAndCitiesFromNote = async (
    note: string,
    openAiService: OpenAIService
): Promise<{ people: string[], cities: string[] }> => {
    const prompt = `You are a helpful assistant who identifies every name and city mentioned in the text.             
    
        <rules>
            - The provided text is in Polish, so the generated JSON should be in Polish.
            - The names and cities must be in their DOMINATOR form.
            - Return ONLY names, WITHOUT any surnames.
            - Return everything in CAPITAL LETTERS.
            - Return cities without Polish characters.
            - Return ONLY JSON in the format: 
              { 'people': ['name-1', 'name-2'], 'cities': ['city-1', 'city-2'] }
            - Make sure to not include polish characters in the output.
        </rules>                 
    
        <examples>
            User: 'Barbara, Aleksander, Andrzej, Rafał, Warszawa, Kraków'.
            AI: { "people": ["BARBARA", "ALEKSANDER", "ANDRZEJ", "RAFAL"], "cities": ["KRAKOW", "WARSZAWA"] }
        </examples>
    `;

    const result = (await openAiService.completion({
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: note },
        ],
    })) as ChatCompletion;

    return JSON.parse(result.choices[0].message.content || '');
};

const fetchCitiesForPeople = async (people: string[]): Promise<string[]> => {
    const citiesSet = new Set<string>();
    await Promise.all(
        people.map(async (person) => {
            const cities: string[] = await fetchData(
                'https://centrala.ag3nts.org/people',
                { query: person }
            );
            cities.forEach((city) => citiesSet.add(city));
        })
    );
    return Array.from(citiesSet);
};

const fetchPeopleForCities = async (
    cities: string[],
    mentionedPeople: string[]
): Promise<string[]> => {
    const peopleSet = new Set<string>();
    await Promise.all(
        cities.map(async (city) => {
            const people: string[] = await fetchData(
                'https://centrala.ag3nts.org/places',
                { query: city }
            );
            people.forEach((person) => {
                if (!mentionedPeople.includes(person)) {
                    peopleSet.add(person);
                }
            });
        })
    );
    return Array.from(peopleSet);
};

const findWantedPossibleLocations = async (
    cities: string[]
): Promise<string[]> => {
    const barbaraLocations: string[] = [];
    await Promise.all(
        cities.map(async (city) => {
            const people: string[] = await fetchData(
                'https://centrala.ag3nts.org/places',
                { query: city }
            );
            if (people.includes(LOOKING_NAME)) {
                barbaraLocations.push(city);
            }
        })
    );
    return barbaraLocations;
};

const recursiveCityPersonSearch = async (
    initialCities: string[],
    initialPeople: string[]
): Promise<string[]> => {
    const visitedCities = new Set(initialCities);
    const visitedPeople = new Set(initialPeople);

    let currentCities = [...initialCities];
    let currentPeople = [...initialPeople];

    while (true) {
        const newCities = await fetchCitiesForPeople(currentPeople);
        const unvisitedCities = newCities.filter((city) => !visitedCities.has(city));

        unvisitedCities.forEach((city) => visitedCities.add(city));

        if (unvisitedCities.length === 0) break;

        const newPeople = await fetchPeopleForCities(unvisitedCities, Array.from(visitedPeople));
        const unvisitedPeople = newPeople.filter((person) => !visitedPeople.has(person));

        unvisitedPeople.forEach((person) => visitedPeople.add(person));

        currentCities = unvisitedCities;
        currentPeople = unvisitedPeople;
    }

    return Array.from(visitedCities);
};

export const loop = async (): Promise<string> => {
    const openAiService = new OpenAIService();
    const noteResponse = await fetch(BARBARA_NOTE_URL);
    const noteText = await noteResponse.text();

    const { people, cities } = await extractNamesAndCitiesFromNote(noteText, openAiService);

    const allKnownCities = await recursiveCityPersonSearch(cities, people);

    const barbaraPossibleLocations = await findWantedPossibleLocations(allKnownCities);

    const filteredBarbaraLocations = barbaraPossibleLocations.filter(
        (city) => !cities.includes(city)
    );

    const { message } = await verifyResults(filteredBarbaraLocations[0], 'loop');

    return message;
};
