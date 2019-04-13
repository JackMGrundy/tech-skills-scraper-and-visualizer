const tasksColumns = [
  {
    width: 200,
    flexGrow: 1.0,
    dataKey: "taskName",
    type: "string",
    label: "Task name"
  },
  {
    width: 200,
    flexGrow: 1.0,
    dataKey: "searchTerm",
    type: "string",
    label: "Search term"
  },
  {
    width: 200,
    flexGrow: 1.0,
    dataKey: "targetCities",
    type: "string",
    label: "Target cities"
  },
  {
    width: 200,
    flexGrow: 1.0,
    dataKey: "creationDate",
    type: "string",
    label: "Creation date"
  },
  {
    width: 200,
    flexGrow: 1.0,
    dataKey: "lastScraped",
    type: "string",
    label: "Last scrape"
  },
  {
    width: 200,
    flexGrow: 1.0,
    dataKey: "numScrapes",
    type: "string",
    label: "# Scrapes completed"
  },
  {
    width: 200,
    flexGrow: 1.0,
    dataKey: "numPosts",
    type: "string",
    label: "# Job posts collected"
  },
  {
    width: 200,
    flexGrow: 1.0,
    dataKey: "status",
    type: "string",
    label: "Status"
  }
];

export default tasksColumns;
