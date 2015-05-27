'use strict';

import { Action, Store, ContextFactory } from '../../../src/geiger';
import { expect } from 'chai';

describe('Geiger', function() {

    let fooaction, foostore, unwatchcbkfoo, unwatchcbkbar;

    it('should provide an Action base class', function() {
        expect(Action).to.be.a('function');
    });

    it('should provide a Store base class', function() {
        expect(Store).to.be.a('function');
    });

    it('should provide a ContextFactory', function() {
        expect(Store).to.be.a('function');
    });

    describe('Actions', function() {
        it('should build an Action object', function() {
            fooaction = new (class extends Action {
                add(what) { this.emit('add', { what }); }
                remove(what) { this.emit('remove', { what }); }
                clear() { this.emit('clear'); }
            })();

            expect(fooaction).to.be.an('object');
        });

        it('should trigger actions', function() {
            expect(() => fooaction.add('bar')).to.not.throw();
        });

        it('should not trigger non-existing actions', function() {
            expect(() => fooaction.hello('bar')).to.throw();
        });

        it('should subscribe to action and to trigger it', function(done) {
            let triggered = false;

            fooaction.on('add', ({ what }) => {
                if(triggered) {
                    throw new Error(`I'm supposed to be triggered only once !`);
                }

                triggered = true;

                done();
            });

            expect(() => fooaction.add('bar')).to.not.throw();
            //expect(() => fooaction.add('baz')).to.throw('done() called multiple times');
        });

        it('should unsubscribe to action', function() {
            expect(() => fooaction.removeAllListeners('add')).to.not.throw();
        });

        it('should be unsubscribed to action', function() {
            expect(() => fooaction.add('baz')).to.not.throw();
        });
    });

    describe('Stores', function() {
        it('should build a foo Store object', function() {

            foostore = new (class extends Store {

                constructor({ actionfoo }) {
                    super();

                    this.foos = {};

                    this.listen(actionfoo, 'add', ({ what }) => {
                        this.foos[what] = 'foo(' + what + ')';
                        this.changed();
                    });

                    this.listen(actionfoo, 'clear', () => {
                        this.foos = {};
                        this.changed();
                    });
                }

                // Public API

                getAll() { return this.foos; }
                get(what) { return what in this.foos ? this.foos[what] : null; }

            })({ actionfoo: fooaction });

            expect(foostore).to.be.an('object');
        });

        it('should have side effects on stores with actions', function(done) {

            fooaction.add('hello');
            fooaction.add('world');

            setTimeout(() => {
                const foos = foostore.getAll();

                expect(foos).to.be.an('object');

                expect(foos).to.include.keys('hello');
                expect(foos).to.include.keys('world');

                expect(foos['hello']).to.equal('foo(hello)');
                expect(foos['world']).to.equal('foo(world)');

                fooaction.clear();

                setTimeout(() => {
                    expect(foostore.getAll()).to.be.empty;
                    done();
                }, 10);

            }, 10);
        });

        it('should subscribe and react to store change', function(done) {

            let triggered = false;

            const updatecbk = () => {

                if(triggered) {
                    throw new Error(`I'm supposed to be triggered only once !`);
                }

                triggered = true;

                const foos = foostore.getAll();

                expect(foos).to.be.an('object');
                //expect(foos).to.have.length.of(1);
                expect(foos).to.include.keys('nice');
                expect(foos['nice']).to.equal('foo(nice)');

                done();
            };

            unwatchcbkfoo = foostore.watch(updatecbk);
            fooaction.add('nice');
        });

        it('should unsubscribe from store change', function(done) {

            expect(() => unwatchcbkfoo()).to.not.throw();
            fooaction.add('nice');
            fooaction.clear();

            setTimeout(done, 20);   // giving time to throw `I'm supposed to be triggered only once !` if not properly unwatched
        });


        describe('Synchronized with waitFor()', function() {

            let barstore;

            it('should build a bar store object depending on foostore', function() {

                barstore = new (class extends Store {

                    constructor({ actionfoo, storefoo }) {
                        super();

                        this.bars = {};

                        this.listen(actionfoo, 'add', ({ what }) => {
                            return this.waitFor([storefoo]).then(() => {
                                this.bars[what] = 'bar(' + storefoo.get(what) + ')';
                                this.changed();
                            });
                        });
                    }

                    // Public API

                    getAll() { return this.bars; }
                    get(what) { return what in this.bars ? this.bars[what] : null; }

                })({ actionfoo: fooaction, storefoo: foostore });

                expect(barstore).to.be.an('object');
            });

            it('should waitFor() depended-upon store', function(done) {

                let footriggered = false;
                let bartriggered = false;

                const updatecbkfoo = () => {

                    if(footriggered) {
                        throw new Error(`FOO: I'm supposed to be triggered only once !`);
                    }

                    footriggered = true;
                };

                const updatecbkbar = () => {

                    if(bartriggered) {
                        throw new Error(`BAR: I'm supposed to be triggered only once !`);
                    }

                    bartriggered = true;

                    done();
                };

                unwatchcbkfoo = foostore.watch(updatecbkfoo);
                unwatchcbkbar = barstore.watch(updatecbkbar);

                fooaction.add('something');
            });

            it('should sequence store reaction in the correct order', function() {
                const foos = foostore.getAll();

                expect(foos).to.be.an('object');
                expect(foos).to.include.keys('something');
                expect(foos['something']).to.equal('foo(something)');

                const bars = barstore.getAll();

                expect(bars).to.be.an('object');
                expect(bars).to.include.keys('something');
                expect(bars['something']).to.equal('bar(foo(something))');
            });
        });
    });
});
