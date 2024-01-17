import { classEvent } from "../util/ClassEvent";

export class MicrophoneController extends classEvent {

    constructor(){

        super();

        this._mimeType = 'audio/webm'

        this._available = false;

        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(stream=>{

            this._available = true;

            this._stream = stream;

            this.trigger('ready', this._stream)

        }).catch(err=>{
            console.error(err);
        });

    }

    isAvailable(){

        return true
    }

    stop(){

        this._stream.getTracks().forEach(track=>{
            track.stop();
        })
    }

    startRecorder(){

        if(this.isAvailable()){

            this._mediaRecorder = new MediaRecorder(this._stream, {
                mimeType: this._mimeType
            });

            this._recordedChuncks = [];

            this._mediaRecorder.addEventListener('dataavailable', e =>{

                if(e.data.size > 0) this._recordedChuncks.push(e.data);

            });

            this._mediaRecorder.addEventListener('stop', e =>{

                let blob = new Blob(this._recordedChuncks, {
                    type: this._mimeType
                });

                let filename = `rec${Date.now()}.webm`

                let file = new File([blob], filename, {
                    type: this._mimeType,
                    lastModified: Date.now()
                });

                console.log('file', file)

                let reader = new FileReader();

                reader.onload = e =>{

                    let audio = new Audio(reader.result)

                    console.log('ReaderFile', file)

                    audio.play();

                }

                reader.readAsDataURL(file);

            });
            
            this._mediaRecorder.start();
            this.startTimer();

        }

    }

    stopRecorder(){

        if(this.isAvailable())  {

            this._mediaRecorder.stop();
            this.stop();
            this.stopTimer()


        }

    }

    startTimer(){
        
        let start = Date.now();

        this._recordMicrophoneInterval = setInterval(()=>{

            this.trigger('recordTimer', (Date.now() - start))

        }, 100);

    }

    stopTimer(){

        clearInterval(this._recordMicrophoneInterval)

    }
}