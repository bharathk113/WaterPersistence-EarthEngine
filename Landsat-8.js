function monthlylayer(D1,D2,t){
  var sr14= ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
  .filterBounds(t)
  .filterDate(D1,D2);
  
  var getQABits = function(image, start, end, newName) {
      // Compute the bits we need to extract.
      var pattern = 0;
      for (var i = start; i <= end; i++) {
         pattern += Math.pow(2, i);
      }
      // Return a single band image of the extracted QA bits, giving the band
      // a new name.
      return image.select([0], [newName])
                    .bitwiseAnd(pattern)
                    .rightShift(start);
  };
  
  // A function to mask out cloudy pixels.
  var cloud_shadows = function(image) {
    // Select the QA band.
    var QA = image.select(['pixel_qa']);
    // Get the internal_cloud_algorithm_flag bit.
    return getQABits(QA, 3,3, 'cloud_shadows').eq(0);
    // Return an image masking out cloudy areas.
  };
  
  // A function to mask out cloudy pixels.
  var clouds = function(image) {
    // Select the QA band.
    var QA = image.select(['pixel_qa']);
    // Get the internal_cloud_algorithm_flag bit.
    return getQABits(QA, 5,5, 'Cloud').eq(0);
    // Return an image masking out cloudy areas.
  };
  
  var maskClouds = function(image) {
    var cs = cloud_shadows(image);
    var c = clouds(image);
    image = image.updateMask(cs);
    return image.updateMask(c);
  };
  
  var composite_free = sr14.map(maskClouds);
  if (composite_free.size().getInfo()==0){
    // print (composite_free.size())
    return 0
  }
  else{
    
    // Reduce the collection by taking the median.
    var median = composite_free.median();
    
    // Clip to the output image to the required boundaries.
    var clipped = median.clipToCollection(t);
    
    var ndwi= clipped.select('B3').subtract(clipped.select('B5'))
      .divide(clipped.select('B3').add(clipped.select('B5')));
    var clippedndwi = ndwi;
    
    var mndwi2= median.select('B3').subtract(median.select('B7'))
      .divide(median.select('B3').add(median.select('B7')));
    var clippedmndwi2 = mndwi2.clipToCollection(t);
    // var visParams = {min: -1,
    //   max: 1,
    // };
    // Map.addLayer(clippedmndwi2, visParams, 'clipped mndwi2');
    
    
    var reflectance= (median.select('B3').add(median.select('B4'))
      .add(median.select('B5')).add(median.select('B7'))).divide(40000);
    var clippedreflectance = reflectance.clipToCollection(t);
    // var visParams = {min: 0,
    //   max: 1,
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
}


var buffersize=200000
// location coordinates around which the buffer will be calculated
var polygon = ee.FeatureCollection(ee.Geometry.Point([78.3, 19]).buffer(buffersize));
// provide the data range for the process
var startyear=2017
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
        var temp=monthlylayer(D1,D2,tabletouse)
        
        if (temp!=0){
          var waterCollection =  ee.ImageCollection.fromImages([temp])
          j=j+1;
        }
        
        // print (D1,D2)
      }
      else{
        var temp = monthlylayer(D1,D2,tabletouse);
        if (temp!=0){
          var water=ee.ImageCollection.fromImages([temp])
          // print (temp)
          var waterCollection = waterCollection.merge(water);
        }
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
Map.addLayer(sum1, {palette: '0F00FF'});
