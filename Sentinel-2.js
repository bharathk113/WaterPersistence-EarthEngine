print ("Use inspector tools to find out how many months water is present for a specific pixel")
function monthlylayer(D1,D2,t){
  function maskS2clouds(image) {
    var qa = image.select('QA60');
  
    // Bits 10 and 11 are clouds and cirrus, respectively.
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;
  
    // Both flags should be set to zero, indicating clear conditions.
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  
    return image.updateMask(mask);
  }
  
  var collection = ee.ImageCollection('COPERNICUS/S2_SR')
      .filterDate(D1, D2)
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',90))
      .map(maskS2clouds);
  
  
  
  // Reduce the collection by taking the median.
  var median = collection.median();
  
  // Clip to the output image to the ROI boundaries.
  var clipped = median.clipToCollection(t);
  
  
  // var visParams = {bands: ['B8', 'B4', 'B3'], min: 0,
  //   max: 5000,
  //   gamma: [1, 1, 1]
  // };

  var ndwi= clipped.select('B4').subtract(clipped.select('B8'))
    .divide(clipped.select('B4').add(clipped.select('B8')));
  var clippedndwi = ndwi;
  // var visParams = {min: -1,
  //   max: 1,
  // };
  // Map.addLayer(clippedndwi, visParams, 'clipped ndwi');
  
  // MNDWI-2.
  // var collection = ee.ImageCollection('COPERNICUS/S2_SR')
  //     .filterDate('2020-04-01', '2020-04-15');
  
  // // Reduce the collection by taking the median.
  // var median = collection.median();
  var mndwi2= median.select('B4').subtract(median.select('B12'))
    .divide(median.select('B4').add(median.select('B12')));
  var clippedmndwi2 = mndwi2.clipToCollection(t);
  // var visParams = {min: -1,
  //   max: 1,
  // };
  // Map.addLayer(clippedmndwi2, visParams, 'clipped mndwi2');
  
  var reflectance= (median.select('B3').add(median.select('B4'))
    .add(median.select('B8')).add(median.select('B12'))).divide(40000);
  var clippedreflectance = reflectance.clipToCollection(t);
  // var visParams = {min: 0,
  //   max: 0.6,
  // };
  // Map.addLayer(clippedreflectance, visParams, 'clipped reflectance');
  
  // NDWI & MNDWI conditions.
  var hybridLayer = clippedmndwi2.add(clippedndwi);
  var palette = ['000000', '0000FF', '00FF00', 'FF0000'];
  // var visParams = {min: -2,
  //   max: 2,
  //   // palette:  palette
  // };
  // Map.addLayer(hybridLayer, visParams, 'hybrid layer');
  // Threshold the hybrid band to set water pixels as value 1, mask all else.
  var waterInit = hybridLayer.gt(0.4)
    .selfMask()
    .rename('waterInit');
  var reflectanceBinary = clippedreflectance.lt(0.2)
    .selfMask()
    .rename('ref'); 
  var water = waterInit.multiply(reflectanceBinary)
    .selfMask()
    .rename('water'); 
  
  // Display the water layers on the Map.
  // Map.addLayer(water, {palette: '0000FF'}, 'water');
  return water
}
// buffer size in meters
var buffersize=200000
// location coordinates around which the buffer will be calculated
var polygon = ee.FeatureCollection(ee.Geometry.Point([78.3, 19]).buffer(buffersize));
// provide the data range for the process
var startyear=2020
var startmonth=6
var endyear=2021
var endmonth=5

var tabletouse=polygon
var date = new Date(), y = date.getFullYear(), m = date.getMonth();
var j=1
// print(startyear,startmonth,endyear,endmonth)
for (y =startyear ; y <=endyear; y++){
  for (m =0 ; m <12; m++){
    // print(y,m)
    if (!(y==startyear && m<startmonth-1) && !(y==endyear && m>endmonth-1)){
      // if (m<6 || m >8){
      var firstDay = new Date(y, m, 1);
      var dd = firstDay.getDate();
      var mm = firstDay.getMonth()+1; 
      var yyyy = firstDay.getFullYear();
      if(dd<10) 
      {
          dd='0'+dd;
      } 
      
      if(mm<10) 
      {
          mm='0'+mm;
      } 
      var firstDay = yyyy+'-'+mm+'-'+dd;
      // print(firstDay)
      // print (y.toString(),m.toString())
      var lastDay = new Date(y, m+1, 0);
      var dd = lastDay.getDate();
      var mm = lastDay.getMonth()+1; 
      var yyyy = lastDay.getFullYear();
      if(dd<10) 
      {
          dd='0'+dd;
      } 
      
      if(mm<10) 
      {
          mm='0'+mm;
      } 
      var lastDay = yyyy+'-'+mm+'-'+dd;
      // print(lastDay)
      var D1=firstDay;
      var D2=lastDay;
      if (j==1){
        var waterCollection =  ee.ImageCollection.fromImages([monthlylayer(D1,D2,tabletouse)])
        j=j+1;
        // print (D1,D2)
      }
      else{
        var water = ee.ImageCollection.fromImages([monthlylayer(D1,D2,tabletouse)]);
        var waterCollection = waterCollection.merge(water);
        // print (D1,D2)
      }
    // }
    }
    // else{
    //   print(y,m,"test")
    // }
  }
}
print (waterCollection)
var sum = waterCollection.reduce(ee.Reducer.sum());
var visParams = {min: 0,
    max: 27,
    palette: ['00FFFF', '0000FF'],
  };
Map.setCenter(78.3, 19, 12);
Map.addLayer(sum, visParams);
var max_num_water = sum.reduceRegion({reducer: ee.Reducer.max(), geometry: tabletouse, scale : buffersize/200});
print ("Check this value and use approximately 5%-10% as misClasThres value in next line",max_num_water)
var misClasThres = 2;
var sum1 = sum.gt(misClasThres).selfMask()
print (sum1)
Map.addLayer(sum1, {palette: 'F000FF'});
