import { useEffect } from 'react';
import { runtime, useGame } from '../app/GameContext';
export function AudioEnvironment(){const {volume,started,paused}=useGame();
  useEffect(()=>{
    if(!started||volume<=0||paused)return;
    const ctx=new AudioContext();void ctx.resume();const gain=ctx.createGain();gain.gain.value=volume*.2;gain.connect(ctx.destination);
    const length=ctx.sampleRate*3,noise=ctx.createBuffer(1,length,ctx.sampleRate),data=noise.getChannelData(0);let seed=13;
    for(let i=0;i<length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*.25;}
    const wind=ctx.createBufferSource();wind.buffer=noise;wind.loop=true;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=280;wind.connect(filter);filter.connect(gain);wind.start();let last=0,ticks=0;
    const timer=setInterval(()=>{const now=ctx.currentTime;ticks++;
      if(runtime.moving&&now-last>(runtime.running?.26:.45)){last=now;const source=ctx.createBufferSource();source.buffer=noise;const foot=ctx.createGain();foot.gain.setValueAtTime(.35,now);foot.gain.exponentialRampToValueAtTime(.001,now+.09);source.connect(foot);foot.connect(gain);source.start(now,0,.1);}
      if(ticks%80===0){const bird=ctx.createOscillator(),envelope=ctx.createGain();bird.type='sine';bird.frequency.setValueAtTime(1900,now);bird.frequency.exponentialRampToValueAtTime(2900,now+.12);envelope.gain.setValueAtTime(.015,now);envelope.gain.exponentialRampToValueAtTime(.001,now+.25);bird.connect(envelope);envelope.connect(gain);bird.start();bird.stop(now+.3);}
    },80);
    return()=>{clearInterval(timer);wind.stop();void ctx.close();};
  },[volume,started,paused]);return null;
}
