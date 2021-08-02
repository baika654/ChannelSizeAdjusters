import { IChannelView } from './channels-interfaces';
import { kMinChannelHeight } from './chart-pane-constants';
import { subjectDescriptorsAreEqual } from './dataset-interfaces';
import { IChannels } from './fakeIChannels';

export function resetChannelsLayout(
   channelsModel: IChannels,
   visibleChannelsHeightPixels: number,
   subjectsGapYPixels: number,
   minChannelHeightPixels: number
) {
   const { lanes: channels } = channelsModel;

   // Get unique subjects.
   const subjects = channels
      .filter((value, index, self) => {
         return (
            self.findIndex((x) =>
               subjectDescriptorsAreEqual(value.subject, x.subject)
            ) === index
         );
      })
      .map((channel) => channel.subject);

   // Now we have lanes sorted by subject we can group them and build the
   // correct lane heights and top pixels.
   let topPixel = 0;
   const totalSubjectsYGap = Math.max(
      0,
      (subjects.length - 1) * subjectsGapYPixels
   );

   const idealChannelHeight =
      (visibleChannelsHeightPixels - totalSubjectsYGap) / channels.length;
   const roundedIdealChannelHeight = Math.round(idealChannelHeight);

   let previousSubject = channels.length > 0 ? channels[0].subject : undefined;
   let leftover = 0;
   for (const channel of channels) {
      if (!subjectDescriptorsAreEqual(previousSubject, channel.subject)) {
         topPixel += subjectsGapYPixels;
         previousSubject = channel.subject;
      }

      leftover += roundedIdealChannelHeight - idealChannelHeight;
      let calculatedLaneHeight = Math.max(
         minChannelHeightPixels,
         roundedIdealChannelHeight
      );

      if (Math.abs(leftover) >= 1) {
         calculatedLaneHeight -= Math.trunc(leftover);
         leftover -= Math.trunc(leftover);
      }

      channel.setTopPixel(topPixel, channelsModel);
      channel.setHeight(calculatedLaneHeight, channelsModel);

      topPixel += calculatedLaneHeight;
   }
}

export function draggingChannelsLayout(
   channelHeights: number[],
   channelsModel: IChannels,
   subjectsGapYPixels: number,
   minChannelHeightPixels: number
): void {
   const { lanes: channels } = channelsModel;
   let topPixel = 0;
   let previousSubject = channels.length > 0 ? channels[0].subject : undefined;

   channels.forEach((channel, index) => {
      if (channelHeights.length !== channels.length) {
         throw Error;
      }

      const resizedChannelHeight = channelHeights[index];

      const calculatedLaneHeight = Math.max(
         minChannelHeightPixels,
         resizedChannelHeight
      );

      if (!subjectDescriptorsAreEqual(previousSubject, channel.subject)) {
         topPixel += subjectsGapYPixels;
         previousSubject = channel.subject;
      }

      channel.setTopPixel(topPixel, channelsModel);
      channel.setHeight(calculatedLaneHeight, channelsModel);
      topPixel += calculatedLaneHeight;
   });
}

/**
 * Fits the specified array of channels into so that their combined heights
 * take up the specified containing view's height.
 *
 * Any channels that have an invalid height are assumed to be new channels
 * and will be initialized to take an equal amount of space as the others.
 *
 * @param channels The channels being fit.
 * @param desiredChannelsHeightPixels The actual height of the containing
 * view.
 * @param minChannelHeightPixels Minimum allowed individual channel height.
 * @param subjectsGapYPixels When adjacent channels have different subjects
 * a pad is added to the second channel via its topPixel
 */
export function fitChannelsLayoutToHeight(
   channelsModel: IChannels,
   desiredChannelsHeightPixels: number,
   minChannelHeightPixels: number,
   subjectsGapYPixels: number,
   suppressFitChannelsInView?: boolean
) {
   const { lanes: channels } = channelsModel;

   if (channels.length === 0) {
      return;
   }

   // The desired height of each channel should match the average height of existing ones.
   const desiredHeightOfEachNewChannel =
      desiredChannelsHeightPixels /
      Math.max(1, channels.filter((ch) => !!ch.height).length);

   // Helper that calculates for each channel, the number of subject gap pixels above it.
   // Produces zero if a channel's subject is the same as the channel before it.
   const addAnySubjectsGapYPixels = (index: number) =>
      index > 0
         ? channels[index].subject?.equals(channels[index - 1].subject)
            ? 0
            : subjectsGapYPixels
         : 0;

   // First step, calculate each channel's desired height, including any new channels.
   const channelPlacements = channels
      .map((channel) => channel.height)
      // Set a default height for any new channels.
      .map((height) => height || desiredHeightOfEachNewChannel)
      // Enforce minimum height
      .map((height) => Math.max(height, minChannelHeightPixels))
      // Determine whether the channel has a subject gap to the previous
      .map((height, index) => ({
         height,
         subjectGap: addAnySubjectsGapYPixels(index)
      }));

   // Get the current height of all channels.
   const sumOfSubjectGaps = channelPlacements.reduce(
      (memo, placement) => memo + placement.subjectGap,
      0
   );
   const sumOfHeights = channelPlacements.reduce(
      (memo, placement) => memo + placement.height,
      0
   );
   const resizeRatio =
      desiredChannelsHeightPixels / (sumOfHeights + sumOfSubjectGaps);

   let leftover = 0;

   // Second, expand or shrink to fit within the view.
   const resizedChannelPlacements = channelPlacements
      .map((placement) => {
         if (suppressFitChannelsInView) {
            return placement;
         }

         const resizedChannelHeight = resizeRatio * placement.height;
         let roundedChannelHeight = Math.trunc(resizedChannelHeight);

         leftover += roundedChannelHeight - resizedChannelHeight;

         if (Math.abs(leftover) >= 1) {
            roundedChannelHeight -= Math.trunc(leftover);
            leftover -= Math.trunc(leftover);
         }

         return {
            ...placement,
            height: roundedChannelHeight
         };
      })
      // Third, enforce minimum channel height.
      .map((placement) => ({
         ...placement,
         height: Math.max(minChannelHeightPixels, placement.height)
      }));

   // Final step, update the passed-in channel heights and top pixels.
   resizedChannelPlacements.forEach(({ height, subjectGap }, index) => {
      const cur = channels[index];
      if (index > 0) {
         const prev = channels[index - 1];
         cur.setTopPixel(
            prev.topPixel + prev.height + subjectGap,
            channelsModel
         );
      } else {
         cur.setTopPixel(0, channelsModel);
      }

      channels[index].setHeight(height, channelsModel);
   });

   // If we didn't fit into the desired view are (because of min height enforcement),
   // return the amount we're off by.
   return (
      resizedChannelPlacements.reduce(
         (memo, placement) => memo + placement.height + placement.subjectGap,
         0
      ) - desiredChannelsHeightPixels
   );
}

export function calculateNewChannelHeights(
   channelHeights: number[],
   draggingChannelIndex: number,
   delta: number,
   channelHeightRatio: number
): number[] {
   const newChannelHeights: number[] = [];

   let leftover = 0;

   channelHeights.forEach((height, index) => {
      let calculatedChannelHeight = channelHeightRatio * height;

      calculatedChannelHeight = Math.max(
         kMinChannelHeight,
         calculatedChannelHeight
      );

      if (index !== draggingChannelIndex) {
         const roundedChannelHeight = Math.round(calculatedChannelHeight);
         leftover += roundedChannelHeight - calculatedChannelHeight;
         calculatedChannelHeight = roundedChannelHeight;
      }

      newChannelHeights.push(calculatedChannelHeight);
   });

   const newDeltaChannelHeight =
      channelHeights[draggingChannelIndex] + delta - leftover;
   newChannelHeights[draggingChannelIndex] = newDeltaChannelHeight;

   return newChannelHeights;
}

export function areaToUpdateChannelHeights(
   totalChannelsHeight: number,
   channelsAtMin: number
): number {
   let areaHeight = totalChannelsHeight;
   if (channelsAtMin > 0) {
      areaHeight -= kMinChannelHeight * channelsAtMin;
   }
   return areaHeight;
}

export function calculateChannelHeightsRatio(
   prevChannelHeights: number,
   draggingChannelHeight: number,
   draggingChannelHeightWithDelta: number
): number {
   const channelsHeightWithoutNewChannelHeight =
      prevChannelHeights - draggingChannelHeightWithDelta;
   const remainingChannelHeights = prevChannelHeights - draggingChannelHeight;

   return channelsHeightWithoutNewChannelHeight / remainingChannelHeights;
}

export function calculateDraggingChannelHeights(
   channelHeights: number[],
   totalChannelsHeight: number,
   delta: number,
   draggingChannelIndex: number,
   maxChannelHeight: number
): number[] {
   const draggingChannelHeightWithDelta =
      channelHeights[draggingChannelIndex] + delta;

   const determineMinHeightRatio = calculateChannelHeightsRatio(
      totalChannelsHeight,
      channelHeights[draggingChannelIndex],
      draggingChannelHeightWithDelta
   );
   const channelsAtMin = channelHeights.filter(
      (height, index) =>
         height * determineMinHeightRatio <= kMinChannelHeight &&
         index !== draggingChannelIndex
   ).length;

   let ratioArea = areaToUpdateChannelHeights(
      totalChannelsHeight,
      channelsAtMin
   );

   if (draggingChannelHeightWithDelta < maxChannelHeight) {
      if (
         channelHeights.length > 0 &&
         channelHeights.length / 2 <= channelsAtMin
      ) {
         ratioArea = totalChannelsHeight + delta;
      }

      const channelHeightRatio = calculateChannelHeightsRatio(
         ratioArea,
         channelHeights[draggingChannelIndex],
         draggingChannelHeightWithDelta
      );
      return calculateNewChannelHeights(
         channelHeights,
         draggingChannelIndex,
         delta,
         channelHeightRatio
      );
   } else {
      return channelHeights;
   }
}

export function maximizeChannelsLayout(
   channelAtMaximumHeight: IChannelView,
   visibleChannelsHeight: number,
   channelsModel: IChannels,
   subjectsGapYPixels: number
) {
   const { lanes: channels } = channelsModel;

   //ADJ: Reloading maximised channels was broken without this.
   //Unfortunately our recations for resize are setup before the DOM
   //has fully loaded.
   if (visibleChannelsHeight === 0) {
      return;
   }

   let topPixel = 0;
   let previousSubject = channels.length > 0 ? channels[0].subject : undefined;

   channels.forEach((channel) => {
      let newChannelHeight = channel.height;
      if (channel === channelAtMaximumHeight) {
         newChannelHeight = visibleChannelsHeight;
      }
      if (!subjectDescriptorsAreEqual(previousSubject, channel.subject)) {
         topPixel += subjectsGapYPixels;
         previousSubject = channel.subject;
      }

      channel.setHeight(newChannelHeight, channelsModel);
      channel.setTopPixel(topPixel, channelsModel);

      topPixel += newChannelHeight;
   });
}

export function findTopAndBottomChannelsFromSeparator(
   topChannel: IChannelView,
   channels: IChannelView[]
): { topChannel: IChannelView; bottomChannel: IChannelView } {
   const topChannelIndex = channels.findIndex((c) => c === topChannel);
   const bottomChannelIndex = topChannelIndex + 1;
   const bottomChannel = channels[bottomChannelIndex];

   if (!topChannel || !bottomChannel)
      throw Error('Unable to find top or bottom lane');

   return {
      topChannel: topChannel,
      bottomChannel: bottomChannel
   };
}
