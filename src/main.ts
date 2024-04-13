import { Actor, Dataset } from 'apify';
import { HttpCrawler, createHttpRouter } from 'crawlee';
import { labels } from './consts.js';
import { testIOInitialize, exportInputData, ListResponse, type PokemonResponse } from './types.js';

await Actor.init();

interface Input {
	testIO?: boolean
}

const input = (await Actor.getInput<Input>()) ?? {}

const {
	testIO = false
} = input

if (testIO) testIOInitialize();

const router = createHttpRouter();

router.addHandler(labels.LIST, async ({ json, request, crawler }) => {
	if (testIO) {
		await exportInputData(request.label, json);
	}
	
	const data: ListResponse = json;	

	for (const result of data.results) {
		await crawler.addRequests([{
			url: result.url,
			label: labels.POKEMON
		}])
	}
})

router.addHandler(labels.POKEMON, async ({ json, request, log }) => {
	if (testIO) {
		await exportInputData(request.label, json);
	}
	
	const pokemon: PokemonResponse = json;

	log.info(`Processing Pokemon '${pokemon.name}'`)

	await Dataset.pushData({
		id: pokemon.id,
		name: pokemon.name,
		abilityCount: pokemon.abilities.length,
		stats: pokemon.stats.map(stat => ({
			name: stat.stat.name,
			base: stat.base_stat,
			effort: stat.effort
		}))	
	})
})

const crawler = new HttpCrawler({
	proxyConfiguration: await Actor.createProxyConfiguration(),
	maxRequestsPerCrawl: 10,
	requestHandler: router	
})

await crawler.run([{
	url: 'https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0',
	label: labels.LIST
}]);

await Actor.exit();
