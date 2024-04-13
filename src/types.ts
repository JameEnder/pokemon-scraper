import { scope } from 'arktype'
import { labels } from './consts.js'
import { KeyValueStore } from 'crawlee'

const listInputSchema = scope({
	$type: {
		count: 'number',
		next: 'string | null',
		previous: 'string | null',
		results: 'result[]'
	},

	result: {
		name: 'string',
		url: 'string'
	}
}).compile()

export type ListResponse = typeof listInputSchema.$type.infer

const pokemonInputSchema = scope({
	$type: {
		abilities: 'ability[]',
		base_experience: 'number',
		cries: {
			latest: 'string',
			legacy: 'string'
		},
		forms: 'form[]',
		game_indices: 'game_indice[]',
		height: 'number',
		held_items: 'held_item[]',
		id: 'number',
		is_default: 'boolean',
		location_area_encounters: 'string',
		moves: 'move[]',
		name: 'string',
		order: 'number',
		past_abilities: 'any[]',
		past_types: 'any[]',
		species: {
			name: 'string',
			url: 'string'
		},
		sprites: 'any',
		stats: 'stat[]',
		types: 'type[]'
	},

	ability: {
		ability: {
			name: 'string',
			url: 'string'
		},
		is_hidden: 'boolean',
		slot: 'number'
	},

	form: {
		name: 'string',
		url: 'string'
	},

	game_indice: {
		game_index: 'number',
		version: {
			name: 'string',
			url: 'string'
		}
	},

	held_item: {
		item: {
			name: 'string',
			url: 'string'
		}
	},
	
	move: {
		move: {
			name: 'string',
			url: 'string'
		},
		version_group_details: 'version_group_detail[]'
	},

	version_group_detail: {
		level_learned_at: 'number',
		move_learn_method: {
			name: 'string',
			url: 'string'
		}
	},

	stat: {
		base_stat: 'number',
		effort: 'number',
		stat: {
			name: 'string',
			url: 'string'
		}
	},

	type: {
		slot: 'number',
		type: {
			name: 'string',
			url: 'string'
		}
	}
}).compile()

export type PokemonResponse = typeof pokemonInputSchema.$type.infer

const inputSchemas = {
	[labels.LIST]: listInputSchema,
	[labels.POKEMON]: pokemonInputSchema
}

const pokemonOutputSchema = scope({
	$type: {
		id: 'number',
		name: 'string',
		abilityCount: 'string',
		stats: 'stat[]'
	},

	stat: {
		name: 'string',
		base: 'number',
		effort: 'number'
	}
}).compile()

let IOData: KeyValueStore | undefined = undefined;
let IOSchemas: KeyValueStore | undefined = undefined;

const exportInputSchemas = async () => {
	const inputSchemasJson: Record<string, any> = {}

	for (const key of Object.keys(inputSchemas)) {
		inputSchemasJson[key] = inputSchemas[key].$type.scope.aliases
	}

	await IOSchemas?.setValue('INPUT-SCHEMAS', inputSchemasJson)
}


const exportOutputSchemas = async () => {
	await IOSchemas?.setValue('OUTPUT-SCHEMAS', [
		JSON.stringify(pokemonOutputSchema.$type.scope.aliases)
	])
}


export const exportInputData = async (label = 'unknown', data: any) => {
	const existingData: any[] = (await IOData?.getValue(label))!;

	existingData.push(data);

	await IOData?.setValue(label, existingData)
} 

export const testIOInitialize = async () => {
	IOData = await KeyValueStore.open('IO-INPUT-DATA');
	IOSchemas = await KeyValueStore.open('IO-SCHEMAS');

	await exportInputSchemas();
	await exportOutputSchemas();

	for (const label of Object.keys(labels)) {
		await IOData?.setValue(label, []);
	}
}


