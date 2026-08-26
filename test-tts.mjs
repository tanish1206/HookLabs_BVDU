import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
    apiKey: 'sk_1b87293aacf330b3d269f59676b27b837bbdebc516016297'
});

async function run() {
    try {
        const audio = await elevenlabs.textToSpeech.convert(
            '9BWtsMINqrJLrRacOk9x',
            {
                text: 'Hello world',
                model_id: 'eleven_multilingual_v2',
                output_format: 'mp3_44100_128'
            }
        );
        console.log("Audio type:", typeof audio);
        console.log("Audio constructor name:", audio.constructor ? audio.constructor.name : 'Unknown');
        // Let's read the first few bytes to verify it's a stream
        if (typeof audio.read === 'function') {
            const chunk = audio.read(10);
            console.log("Read chunk:", chunk);
        } else if (audio instanceof ReadableStream) {
            console.log("Is web ReadableStream");
            // Node.js web stream
            const reader = audio.getReader();
            const { value } = await reader.read();
            console.log("Read web stream chunk length:", value ? value.length : 0);
        } else {
            console.log("Audio:", audio);
        }
    } catch (err) {
        if (err.statusCode) {
            console.error(err.statusCode, err.body);
        } else {
            console.error(err);
        }
    }
}

run();
