# Flow transcript (React)

This package provides utilities for rendering transcription data from sessions with the [Speechmatics Flow API](https://docs.speechmatics.com/flow).


This package leverages the underlying [React client for Flow](https://www.npmjs.com/package/@speechmatics/flow-client-react), providing additional logic for grouping transcription data together between agent and users.

## Install

```
npm i @speechmatics/use-flow-transcript
```

## Usage

```tsx
import {
  useFlowTranscript,
  transcriptGroupKey,
  wordsToText,
} from '@speechmatics/use-flow-transcript';

// This must be called in a child of the FlowProvider component
// Once the session is started (elsewhere in your app), the transcript groups will populate.
const transcriptGroups = useFlowTranscript();

return (
 <div>
   {transcriptGroups.map((group) => (
     <div key={transcriptGroupKey(group)}>
       {group.type === 'speaker' ? (
         <span>{wordsToText(group.data)}</span>
       ) : (
         <span>
             {group.data.map((response) => response.text).join(' ')}
         </span>
       )}
     </div>
   ))}
 </div>
)
```