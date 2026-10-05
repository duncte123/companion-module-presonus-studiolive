import { CompanionFeedbackDefinition, CompanionFeedbackDefinitions, DropdownChoice, combineRgb } from '@companion-module/base';
import type { ChannelSelector } from '@duncte123/presonus-studiolive-api';
import type Instance from './index';
import { extractChannelSelector, generateChannelSelectOption, generateMixSelectOption } from './util/channelUtils';
import { parseChannelString } from '@duncte123/presonus-studiolive-api/dist/lib/util/channelUtil'
import path from 'node:path';
import fs from 'node:fs';
import { createCanvas } from 'canvas';

const withChannelSelector = function <T>(fn: (
    action: Parameters<CompanionFeedbackDefinition['callback']>[0],
    context: Parameters<CompanionFeedbackDefinition['callback']>[1],
    channel: ChannelSelector
) => T) {
    return ((feedback, context) => {
        const selector = extractChannelSelector(feedback.options)
        if (!selector) return

        return fn(feedback, context, selector)
    }) satisfies CompanionFeedbackDefinition['callback']

}

export default function generateFeedback(this: Instance, channels: DropdownChoice[], mixes: DropdownChoice[]) {
    const channelSelectOptions = generateChannelSelectOption(channels)
    const mixSelectOptions = generateMixSelectOption(mixes, "Mix Source")

    return {
        ChannelMute: {
            type: 'boolean',
            name: 'Mute status',
            description: 'Mute status of a channel',
            defaultStyle: {
                color: combineRgb(0, 0, 0),
                bgcolor: combineRgb(255, 0, 0),
            },
            options: [
                channelSelectOptions,
                mixSelectOptions
            ],
            callback: withChannelSelector((feedback, context, channel) => {
                return !!this.client.getMute(channel)

            })
        },
        ChannelFader: {
          type: 'advanced',
          name: 'Fader Volume progress bar',
          description: 'Assigned channel colour',
          options: [
            channelSelectOptions,
            mixSelectOptions,
          ],
          callback: withChannelSelector((feedback, context, channel) => {
            const faderValue = parseInt(this.client.getLevel(channel), 10);
            const canvas = createCanvas(100, 100);
            const ctx = canvas.getContext('2d');

            ctx.strokeStyle = 'white';
            ctx.strokeRect(5, 75, 90, 20);
            // ctx.strokeRect(0, 75, 100, 20);

            ctx.fillStyle = 'white';
            ctx.fillRect(5, 75, Math.max(0, faderValue - 10), 20);

            ctx.fillStyle = 'red';
            ctx.fillRect(70, 75, 2, 20);

            const channelNameSelector = parseChannelString(channel) + '/username';
            const channelName = this.client.state.get(channelNameSelector);

            return {
              // text: `${channel.channel}: ${faderValue}`,
              text: channelName,
              // text: `${imagePath}`,
              // text: `${faderValue}.png`,
              // png64: data.toString('base64'),
              png64: canvas.toBuffer().toString('base64'),
            };
          }),
        },
        ChannelColour: {
            type: 'advanced',
            name: 'Channel colour',
            description: 'Assigned channel colour',
            options: [
                channelSelectOptions
            ],
            callback: withChannelSelector((feedback, context, channel) => {
                let colour: string = this.client.getColour(channel)
                if (!colour) return {};

                const [R, G, B, A] = Buffer.from(colour, 'hex')
                if (R + G + B == 0) return {};

                return {
                    bgcolor: combineRgb(R, G, B)
                }
            })
        }
    } satisfies CompanionFeedbackDefinitions;
}
