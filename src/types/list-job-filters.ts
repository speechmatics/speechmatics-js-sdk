/* Note: This type is based on the schema but it is not in a model.
   Currently we are only generating types for models, but if that changes, we can move this. */
export default interface RetrieveJobsFilters {
  created_before?: string;
  limit?: number;
  include_deleted?: boolean;
}
