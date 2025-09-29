import type { CompanionActionDefinition, CompanionActionDefinitions, CompanionInputFieldDropdown, CompanionInputFieldNumber, DropdownChoice } from "@companion-module/base"
import { ChannelSelector } from "@duncte123/presonus-studiolive-api"
import { ValueSeparator } from "./Constants"
import { extractChannelSelector } from "./channelUtils"

export function generateTransitionPeriodOption(transitionDefaultMs: number): CompanionInputFieldNumber {
	return {
		label: 'Transition time (ms)',
		type: 'number',
		id: 'transition',
		default: transitionDefaultMs,
		min: 0,
		max: 60 * 1000
	}
}

export function generatedBStep(defaultStep: number): CompanionInputFieldNumber {
	return {
		label: 'Step',
		type: 'number',
		id: 'step',
		default: defaultStep,
		min: 1,
		max: 100
	}
}
