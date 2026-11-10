// "dummyjson": the chart reads real data from DummyJSON.
// "sample": DummyJSON has no such data, so the chart shows hand-made sample data until the
// project has its own server.
export type AdminDataSource = "dummyjson" | "sample";
