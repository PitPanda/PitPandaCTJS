'use strict';

/*
Code taken from https://gist.github.com/Rich-Harris/11010768
*/

/**
 * @template T
 * @class
 */
class Promise{

  static PENDING = {}
  static FULFILLED = {}
  static REJECTED = {}

  /**
   * @param {() => T} callback 
   */
  constructor(callback){
    this.resolver = callback;
    this.fulfilledHandlers = [];
    this.rejectedHandlers = [];
    this.state = Promise.PENDING;
    this.result;
    this.dispatchHandlers;
    this.fulfil = this._makeResolver( Promise.FULFILLED );
    this.reject = this._makeResolver( Promise.REJECTED );

    callback(this.fulfil, this.reject);
  }

  /**
   * @template P
   * @param {(value: T) => P)} onFulfilled 
   * @param {(value: T) => P)} onRejected 
   * @returns {Promise<P>}
   */
  then( onFulfilled, onRejected ) {
    
    var promise2 = new Promise( ( fulfil, reject ) => {
      
      var processResolutionHandler = ( handler, handlers, forward ) => {

        // 2.2.1.1
        if ( typeof handler === 'function' ) {
          handlers.push( function ( p1result ) {
            var x;

            try {
              x = handler( p1result );
              resolve( promise2, x, fulfil, reject );
            } catch ( err ) {
              reject( err );
            }
          });
        } else {
          // Forward the result of promise1 to promise2, if resolution handlers
          // are not given
          handlers.push( forward );
        }
      };

      // 2.2
      processResolutionHandler( onFulfilled, this.fulfilledHandlers, fulfil );
      processResolutionHandler( onRejected, this.rejectedHandlers, reject );

      if ( this.state !== Promise.PENDING ) {
        // If the promise has resolved already, dispatch the appropriate handlers asynchronously
        wait( this.dispatchHandlers );
      }

    });

    return promise2;
  }

  /**
   * @template P
   * @param {(value: T) => P)} onRejected 
   * @returns {Promise<P>}
   */
  catch( onRejected ) {
    return this.then( null, onRejected );
  };

  _makeResolver(newState){
    return ( value ) => {
      if ( this.state !== Promise.PENDING ) {
        return;
      }

      this.result = value;
      this.state = newState;

      // Log all promise rejection values (hopefully temporary but helps for debugging)
      if(this.state === Promise.REJECTED) console.log(value.toString());

      this.dispatchHandlers = makeDispatcher( ( this.state === Promise.FULFILLED ? this.fulfilledHandlers : this.rejectedHandlers ), this.result );

      // dispatch onFulfilled and onRejected handlers asynchronously
      wait( this.dispatchHandlers );
    };
  }
  
  /**
   * @template P
   * @param {Promise<P>[]} promises 
   * @returns {Promise<P[]>}
   */
  static all( promises ) {
    return new Promise( function ( fulfil, reject ) {
      var result = [], pending, i, processPromise;
  
      if ( !promises.length ) {
        fulfil( result );
        return;
      }
  
      processPromise = function ( i ) {
        var current = promises[i];
        if(!(current instanceof Promise)) current = Promise.resolve(current)
        current.then( function ( value ) {
          result[i] = value;
      
          if ( !--pending ) {
            fulfil( result );
          }
        }, reject );
      };
  
      pending = i = promises.length;
      while ( i-- ) {
        processPromise( i );
      }
    });
  }

  /**
   * @template P
   * @param {Promise<P>[]} promises 
   * @returns {Promise<P>}
   */
  static race( promises ) {
    return new Promise( function ( fulfil, reject ) {
      promises.forEach( function ( promise ) {
        promise.then( fulfil, reject );
      });
    });
  }

  /**
   * @template P
   * @param {P | Promise<P>} promises 
   * @returns {Promise<P>}
   */
  static resolve( value ) {
    if(value instanceof Promise) return value;
    return new Promise( function ( fulfil ) {
      fulfil( value );
    });
  }

  /**
   * @template P
   * @param {P} reason 
   * @returns {Promise<P>}
   */
  static reject( reason ) {
    if(value instanceof Promise) return value;
    return new Promise( function ( fulfil, reject ) {
      reject( reason );
    });
  }
}

// TODO use MutationObservers or something to simulate setImmediate
function wait ( callback ) {
  setTimeout( callback, 0 );
}

function makeDispatcher ( handlers, result ) {
  return function () {
    var handler;

    while ( handler = handlers.shift() ) {
      handler( result );
    }
  };
}

function resolve ( promise, x, fulfil, reject ) {
  // Promise Resolution Procedure
  var then;

  // 2.3.1
  if ( x === promise ) {
    throw new TypeError( 'A promise\'s fulfillment handler cannot return the same promise' );
  }

  // 2.3.2
  if ( x instanceof Promise ) {
    x.then( fulfil, reject );
  }

  // 2.3.3
  else if ( x && ( typeof x === 'object' || typeof x === 'function' ) ) {
    try {
      then = x.then; // 2.3.3.1
    } catch ( e ) {
      reject( e ); // 2.3.3.2
      return;
    }

    // 2.3.3.3
    if ( typeof then === 'function' ) {
      var called, resolvePromise, rejectPromise;

      resolvePromise = function ( y ) {
        if ( called ) {
          return;
        }
        called = true;
        resolve( promise, y, fulfil, reject );
      };

      rejectPromise = function ( r ) {
        if ( called ) {
          return;
        }
        called = true;
        reject( r );
      };

      try {
        then.call( x, resolvePromise, rejectPromise );
      } catch ( e ) {
        if ( !called ) { // 2.3.3.3.4.1
          reject( e ); // 2.3.3.3.4.2
          called = true;
          return;
        }
      }
    }

    else {
      fulfil( x );
    }
  }

  else {
    fulfil( x );
  }
}

export default Promise;
