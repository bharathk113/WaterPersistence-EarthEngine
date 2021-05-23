print ("Use inspector tools to find out how many months water is present for a specific pixel")
function monthlylayer(D1,D2,t){
  var focal_filter_distance=50
  var collection = ee.ImageCollection("COPERNICUS/S1_GRD")
      .filterDate(D1, D2)
      .filterBounds(t)
      .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
      .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
      .filter(ee.Filter.eq('instrumentMode', 'IW'))
      .filterMetadata('resolution_meters', 'equals', 10);
  
  // Filter speckle noise
  var filterSpeckles = function(img) {
    var vv = img.select('VV') //select the VV polarization band
    var vv_smoothed = vv.focal_median(50,'circle','meters').rename('VV_Filtered') //Apply a focal median filter
    var vh = img.select('VH') //select the VV polarization band
    var vh_smoothed = vh.focal_median(50,'circle','meters').rename('VH_Filtered') //Apply a focal median filter
    img = img.addBands(vv_smoothed) // Add filtered VV band to original image
    return img.addBands(vh_smoothed)
  }
  
  // Map speckle noise filter across collection. Result is same collection, with smoothed VV band added to each image
  var S1 = collection.map(filterSpeckles)
  
  //Add speckle filtered image to map to sompare with raw SAR image
  // Map.addLayer(S1.first(),{bands: 'VV',min: -25, max: 18}, 'VH')
  // Map.addLayer(S1.first(),{bands: 'VH',min: -25, max: 18}, 'VV')
  // Map.addLayer(S1.first(),{bands: 'VV_Filtered',min: -25, max: 18}, 'Filtered VH image')
  // Map.addLayer(S1.first(),{bands: 'VH_Filtered',min: -25, max: 18}, 'Filtered VV image')
  // Reduce the collection by taking the median.
  var median = S1.median();
  
  // Clip to the output image to the ROI boundaries.
  var clipped = median.clipToCollection(t);
  
  
  // var visParams = {bands: ['B8', 'B4', 'B3'], min: 0,
  //   max: 5000,
  //   gamma: [1, 1, 1]
  // };

  var median_vv= clipped.select('VV_Filtered')
  var median_vh= clipped.select('VH_Filtered')

  var vv_th = median_vv.lt(-19)
    .selfMask()
    .rename('vv_th');
  var vh_th = median_vh.lt(-17)
    .selfMask()
    .rename('vh_th'); 
  var water = vv_th.multiply(vh_th)
    .selfMask()
    .rename('water'); 
  
  // Display the water layers on the Map.
  // Map.addLayer(water, {palette: '0000FF'}, 'water');
  return water
}
// buffer size in meters
var buffersize=200000
// location coordinates around which the buffer will be calculated
var lon= 78.3
var lat= 19
var polygon = ee.FeatureCollection(ee.Geometry.Point([lon, lat]).buffer(buffersize));
// provide the data range for the process
var startyear=2018
var startmonth=1
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
    max: 45,
    palette: ['00FFFF', '0000FF'],
  };
Map.setCenter(lon, lat, 14);
Map.addLayer(sum, visParams);
var max_num_water = sum.reduceRegion({reducer: ee.Reducer.max(), geometry: tabletouse, scale : 1000});
print ("Check this value and use approximately 5%-10% as misClasThres value in next line",max_num_water)
var misClasThres = 3;
var sum1 = sum.gt(misClasThres).selfMask()
print (sum1)
Map.addLayer(sum1, {palette: 'F000FF'});
