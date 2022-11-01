$(function () {
   console.log('work');

   $.get('https://www.randomnumberapi.com/api/v1.0/random?min=1&max=6&count=2', function( data ) {
      $('.result').html( data );
      // alert( "Load was performed." );
   });
});