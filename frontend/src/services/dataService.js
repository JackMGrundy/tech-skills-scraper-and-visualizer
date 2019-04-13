import coordinatesList from "../components/charts/cities.json";

// https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  // Return array of year and week number
  return { year: d.getUTCFullYear(), week: weekNo };
}

// https://stackoverflow.com/questions/7580824/how-to-convert-a-week-number-to-a-date-in-javascript
function firstDayOfWeek(year, week) {
  // Jan 1 of 'year'
  var d = new Date(year, 0, 1),
    offset = d.getTimezoneOffset();

  // ISO: week 1 is the one with the year's first Thursday
  // so nearest Thursday: current date + 4 - current day number
  // Sunday is converted from 0 to 7
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));

  // 7 days * (week - overlapping first week)
  d.setTime(
    d.getTime() +
      7 * 24 * 60 * 60 * 1000 * (week + (year === d.getFullYear() ? -1 : 0))
  );

  // daylight savings fix
  d.setTime(d.getTime() + (d.getTimezoneOffset() - offset) * 60 * 1000);

  // back to Monday (from Thursday)
  d.setDate(d.getDate() - 3);

  return d;
}

//stackoverflow.com/questions/3066586/get-string-in-yyyymmdd-format-from-js-date-object
let yyyymmdd = function(date) {
  var mm = date.getMonth() + 1; // getMonth() is zero-based
  var dd = date.getDate();

  return [
    date.getFullYear() + "-",
    (mm > 9 ? "" : "0") + mm + "-",
    (dd > 9 ? "" : "0") + dd
  ].join("");
};

var cmp = function(a, b) {
  if (a > b) return +1;
  if (a < b) return -1;
  return 0;
};

// Min date: date string
// Max date: date string
var dateRange = function(data, minDate = null, maxDate = null) {
  let dates = new Set();
  let res = [];

  if (minDate) minDate = new Date(minDate);
  if (maxDate) maxDate = new Date(maxDate);

  Object.keys(data).forEach(key => {
    let jobPost = data[key];
    let posted = new Date(jobPost.posted);

    // Filter by minDate and maxDate
    if ((!minDate || posted > minDate) && (!maxDate || posted < maxDate)) {
      let weekYear = getWeekNumber(posted);
      let checkString = weekYear.year + "-" + weekYear.week;
      if (!dates.has(checkString)) {
        res.push(weekYear);
        dates.add(checkString);
      }
    }
  });

  res.sort(function(a, b) {
    return cmp(a.year, b.year) || cmp(a.week, b.week);
  });

  return res;
};

// Filter data by date range
var filterByDate = function(data, minDate = null, maxDate = null) {
  if (minDate) minDate = new Date(minDate);
  if (maxDate) maxDate = new Date(maxDate);

  data = data.filter((datum, index, arr) => {
    let res = true;
    let curDate = new Date(datum.posted);
    if (minDate && curDate <= minDate) res = false;
    if (maxDate && curDate >= maxDate) res = false;
    return res;
  });

  return data;
};

// Filter by city
var filterByCities = function(data, selectedCities = null) {
  if (!selectedCities || selectedCities.length === 0) return data;
  data = data.filter((datum, index, arr) => {
    return selectedCities.indexOf(datum.city) !== -1;
  });
  return data;
};

// Filter by technology/skill
var filterBySkills = function(data, selectedTech = null) {
  if (!selectedTech || selectedTech.length === 0) return data;
  data = data.filter((datum, index, arr) => {
    let temp = datum.technologies;
    let res = false;
    selectedTech.forEach(tech => {
      if (temp.indexOf(tech) !== -1) {
        res = true;
      }
    });
    return res;
  });
  return data;
};

var uniqueCities = function(data) {
  let cities = new Set();
  Object.keys(data).forEach(key => {
    cities.add(data[[key]].city);
  });
  let res = [...cities];
  return res;
};

var barData = function(
  data,
  selectedTech,
  selectedCities = null,
  minDate = null,
  maxDate = null
) {
  if (
    !data ||
    !selectedTech ||
    selectedTech.length === 0 ||
    Object.keys(data).length === 0
  )
    return [];
  data = JSON.parse(JSON.stringify(data));
  // Filter by date
  data = filterByDate(data, minDate, maxDate);
  // Filter by city
  data = filterByCities(data, selectedCities);

  let res = {};
  selectedTech.forEach(t => {
    let temp = {
      name: t,
      count: 0
    };
    res[[t]] = temp;
  });

  let check = new Set(selectedTech);

  // Count up instances of technologies
  Object.keys(data).forEach(key => {
    data[key].technologies.forEach(t => {
      if (check.has(t)) res[[t]].count = res[[t]].count + 1;
    });
  });

  // Convert to final format
  let final = {};
  Object.keys(res).forEach(key => {
    final[[key]] = res[key].count;
  });
  final['name'] = "counts";

  return [final];
};

// Min date: date string
// Max date: date string
var lineData = function(
  data,
  task,
  selectedCities = null,
  selectedTech = null,
  minDate = null,
  maxDate = null
) {
  if (!data || Object.keys(data).length === 0) return [];
  // Filter by date
  data = filterByDate(data, minDate, maxDate);
  let dates = dateRange(data);
  let temp = {};
  let res = [];

  // Make dictionary mapping year-week# -> counts of job posts
  Object.keys(dates).forEach(key => {
    let nextKey = dates[key].year + "-" + dates[key].week;
    let name = "" + yyyymmdd(firstDayOfWeek(dates[key].year, dates[key].week));
    temp[nextKey] = { name: name };
    // Add "skill": 0 in each year-weak value
    task.skills.forEach(skillGroup => {
      let nxtSkill = skillGroup[0];
      // Only include selected tech
      if (!selectedTech || selectedTech.indexOf(nxtSkill) !== -1) {
        temp[nextKey][[nxtSkill]] = 0;
      }
    });
  });

  // Iterate through data and count up occurrences of skills
  Object.keys(data).forEach(key => {
    // Get info for next data point
    const { posted, city, technologies } = data[key];
    let curDate = new Date(posted);
    let weekYear = getWeekNumber(curDate);
    let dataKey = weekYear.year + "-" + weekYear.week;

    // Filter by city
    if (
      !selectedCities ||
      selectedCities.length === 0 ||
      selectedCities.indexOf(city) !== -1
    ) {
      // Count up occurrences of technologies
      technologies.forEach(tech => {
        // Filter by tech
        if (!selectedTech || selectedTech.indexOf(tech) !== -1) {
          temp[[dataKey]][[tech]] += 1;
        }
      });
    }
  });

  // Convert of final format
  Object.keys(temp).forEach(key => {
    res.push(temp[key]);
  });

  return res;
};

// Generate date used in D3 map
var mapData = function(
  data,
  selectedTech = null, //a single technology
  maxSize = 2.0,
  selectedCities = null,
  minDate = null,
  maxDate = null
) {
  if (!data || Object.keys(data).length === 0 || !selectedTech) return [];
  // Filter by date
  data = filterByDate(data, minDate, maxDate);
  // Filter by city
  data = filterByCities(data, selectedCities);
  // Format object to return
  let temp = {};
  let cities = new Set();
  Object.keys(data).forEach(key => {
    let city = data[key].city;
    // If we have not already made an entry for this city
    if (!cities.has(city)) {
      // If we have coordinates for the city
      if (Object.keys(coordinatesList).indexOf(city) !== -1) {
        temp[[city]] = {
          markerOffset: 0,
          name: city,
          coordinates: coordinatesList[[city]],
          size: 0,
          count: 0
        };
      }
      cities.add(city);
    }
  });

  // Count up occurences of technology and identify max count
  let maxCount = 0;
  Object.keys(data).forEach(key => {
    let city = data[key].city;
    // We had coordinates for this city
    if (Object.keys(coordinatesList).indexOf(city) !== -1) {
      if (data[key].technologies.indexOf(selectedTech) !== -1) {
        temp[[city]].count += 1;
        if (temp[[city]].count > maxCount) maxCount = temp[[city]].count;
      }
    }
  });

  // If no matches were found, return none
  if (maxCount === 0) return [];

  // Scale such that maxCount = maxSize
  maxSize = parseFloat(maxSize); // Make sure float
  let scalingFactor = maxCount / maxSize;

  // Assign sizes to coordinates create final object to return
  let res = [];
  Object.keys(temp).forEach(key => {
    temp[key].size = temp[key].count / scalingFactor;
    // Ignore size 0
    if (temp[key].size > 0) res.push(temp[key]);
  });

  return res;
};

// Format data for heatmap
var heatMapData = function(
  data,
  selectedTech = null,
  selectedCities = null,
  minDate = null,
  maxDate = null
) {
  if (!data || Object.keys(data).length === 0 || !selectedTech) return [];
  // Filter by date
  data = filterByDate(data, minDate, maxDate);
  // Filter by city
  data = filterByCities(data, selectedCities);

  // Format object to return
  let pairwiseCounts = {};
  selectedTech.forEach(tech1 => {
    selectedTech.forEach(tech2 => {
      let key = tech1 + "-" + tech2;
      pairwiseCounts[[key]] = { value: 0 };
    });
  });

  // Counts
  let counts = {};
  selectedTech.forEach(tech => {
    counts[[tech]] = 0;
  });

  Object.keys(data).forEach(key => {
    // Get counts
    data[key].technologies.forEach(tech => {
      counts[[tech]] += 1;
    });

    // Get pairwise counts
    data[key].technologies.forEach(tech1 => {
      data[key].technologies.forEach(tech2 => {
        let key = tech1 + "-" + tech2;
        // Ignore tech that hasn't been selected
        if (Object.keys(pairwiseCounts).indexOf(key) !== -1)
          pairwiseCounts[[key]].value += 1;
      });
    });
  });

  // Get frequencies
  let res = [];
  selectedTech.forEach(tech1 => {
    selectedTech.forEach(tech2 => {
      let key = tech1 + "-" + tech2;
      // Ignore tech that hasn't been selected
      if (Object.keys(pairwiseCounts).indexOf(key) !== -1) {
        let value = 0;
        if (counts[[tech1]] !== 0)
          value = pairwiseCounts[[key]].value / counts[[tech1]];

        res.push({ group: [tech1], variable: [tech2], value: value });
      }
    });
  });

  return res;
};

let filteredData = function(data, cityList = null, techList = null) {
  let filteredData = data;
  if (cityList) filteredData = filterByCities(data, cityList);
  if (techList) filteredData = filterBySkills(filteredData, techList);
  return filteredData;
};

let jobPostsTableData = function(data, cityList = null, techList = null) {
  const jobPostsTableData = JSON.parse(
    JSON.stringify(filteredData(data, cityList, techList))
  );
  Object.keys(jobPostsTableData).forEach(key => {
    jobPostsTableData[[key]].jobkey =
      "https://www.indeed.com/viewjob?jk=" + jobPostsTableData[[key]].jobkey;
    jobPostsTableData[[key]].technologies = jobPostsTableData[
      [key]
    ].technologies.join(", ");
    jobPostsTableData[[key]].posted = jobPostsTableData[[key]].posted.slice(
      0,
      15
    );
    jobPostsTableData[[key]].city =
      jobPostsTableData[[key]].city.charAt(0).toUpperCase() +
      jobPostsTableData[[key]].city.slice(1);
    jobPostsTableData[[key]].state = jobPostsTableData[
      [key]
    ].state.toUpperCase();
    jobPostsTableData[[key]].title =
      jobPostsTableData[[key]].title.charAt(0).toUpperCase() +
      jobPostsTableData[[key]].title.slice(1);
    jobPostsTableData[[key]].company =
      jobPostsTableData[[key]].company.charAt(0).toUpperCase() +
      jobPostsTableData[[key]].company.slice(1);
  });
  return jobPostsTableData;
};

let cityTableData = function(data, selectedTech) {
  const mapData = this.mapData(data, selectedTech);
  let cityTableData = [];
  mapData.forEach(city => {
    let temp = {
      name: city.name.charAt(0).toUpperCase() + city.name.slice(1),
      count: "" + city.count
    };
    cityTableData.push(temp);
  });
  return cityTableData;
};

export default {
  lineData,
  mapData,
  filterByDate,
  heatMapData,
  uniqueCities,
  filterByCities,
  filterBySkills,
  filteredData,
  jobPostsTableData,
  cityTableData,
  barData
};
