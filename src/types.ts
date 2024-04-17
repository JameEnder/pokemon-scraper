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
		abilityCount: 'number',
		stats: 'stat[]'
	},

	stat: {
		name: 'string',
		base: 'number',
		effort: 'number'
	}
}).compile()


const exportInputSchemas = async () => {
	const existingSchemas: Record<string, Record<string, any>> = await KeyValueStore.getValue('IO_SCHEMAS') ?? {}

	existingSchemas['INPUT'] = {}

	for (const key of Object.keys(inputSchemas)) {
		existingSchemas['INPUT'][key] = inputSchemas[key].$type.scope.aliases
	}

	await KeyValueStore.setValue('IO_SCHEMAS', existingSchemas)
}


const exportOutputSchemas = async () => {
	const existingSchemas: Record<string, any[]> = await KeyValueStore.getValue('IO_SCHEMAS') ?? {}

	existingSchemas['OUTPUT'] = [
		pokemonOutputSchema.$type.scope.aliases
	];

	await KeyValueStore.setValue('IO_SCHEMAS', existingSchemas)
}


export const exportInputData = async (label = 'unknown', data: any) => {
	const existingData: Record<string, any[]> = await KeyValueStore.getValue('IO_DATA') ?? {};

	existingData[label].push(data);

	await KeyValueStore.setValue('IO_DATA', existingData)
} 

export const testIOInitialize = async () => {
	await exportInputSchemas();
	await exportOutputSchemas();

	for (const label of Object.keys(labels)) {
		const previousData: Record<string, any[]> = await KeyValueStore.getValue('IO_DATA') ?? {}

		previousData[label] = [];

		await KeyValueStore.setValue('IO_DATA', previousData);
	}
}


