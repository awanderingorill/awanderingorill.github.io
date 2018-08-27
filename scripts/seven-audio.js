var psynth = new Tone.PolySynth(12, Tone.FMSynth).toMaster();
psynth.volume.value = -20;
psynth.set('harmonicity', 1.5);
psynth.set('modulationIndex', 4);
psynth.set({
	modulation: {
		type: 'square'
	},
	oscillator: {
		type: 'sine'
	},
	envelope: {
		attack: 0.001,
		decay: 0.3,
		sustain: 0.2,
		release: 0.9
	}
});

var psynth2 = new Tone.PolySynth(4, Tone.FMSynth);
psynth2.volume.value = -12;
psynth2.set('harmonicity', 2);
psynth2.set('modulationIndex', 0.5);
psynth2.set({
	modulation: {
		type: 'sine'
	},
	oscillator: {
		type: 'sine'
	},
	envelope: {
		attack: 0.02,
		decay: 0.5,
		sustain: 0.1,
		release: 0.9
	}
});

var trem = new Tone.Tremolo(3, 0.5).toMaster().start();
psynth2.connect(trem);

// var freeverb = new Tone.Freeverb();
var feedbackDelay = new Tone.FeedbackDelay('2n', 0.2).toMaster();

psynth.connect(feedbackDelay);

var pat1 = new Tone.Pattern(function(time, note){
  psynth.triggerAttackRelease(note, '8n', time);
}, [
	Tone.Frequency(48, 'midi')], 'up');
pat1.humanize = true;
pat1.interval = '2n';
pat1.start('4n');

var pat2 = new Tone.Pattern(function(time, note){
  psynth2.triggerAttackRelease(note, '4n', time);
}, [
	Tone.Frequency(67, 'midi'),
	Tone.Frequency(70, 'midi'),
	Tone.Frequency(78, 'midi'),
	Tone.Frequency(67, 'midi'),
	Tone.Frequency(70, 'midi'),
	Tone.Frequency(78, 'midi'),
	Tone.Frequency(67, 'midi'),
	Tone.Frequency(70, 'midi'),
	Tone.Frequency(78, 'midi'),
	Tone.Frequency(67, 'midi'),
	Tone.Frequency(70, 'midi'),
	Tone.Frequency(78, 'midi'),
	Tone.Frequency(66, 'midi'),
	Tone.Frequency(70, 'midi'),
	Tone.Frequency(78, 'midi'),
	Tone.Frequency(66, 'midi'),
	Tone.Frequency(70, 'midi'),
	Tone.Frequency(78, 'midi'),
	Tone.Frequency(66, 'midi'),
	Tone.Frequency(70, 'midi'),
	Tone.Frequency(78, 'midi'),
	Tone.Frequency(66, 'midi'),
	Tone.Frequency(70, 'midi'),
	Tone.Frequency(78, 'midi'),], 'up');
pat2.humanize = false;
pat2.interval = '8n';
pat2.start('4n');

// Tone.Transport.loopEnd = '2m';
// Tone.Transport.loop = true;
Tone.Transport.bpm.value = 48;
Tone.Transport.start();