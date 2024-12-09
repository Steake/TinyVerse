export class DateTransform {
  static serialize(date: Date): string {
    return date.toISOString();
  }

  static deserialize(dateString: string): Date {
    return new Date(dateString);
  }

  static transformRequest(data: any): any {
    if (!data) return data;

    if (data instanceof Date) {
      return DateTransform.serialize(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => DateTransform.transformRequest(item));
    }

    if (typeof data === 'object') {
      const transformed: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        transformed[key] = DateTransform.transformRequest(value);
      }
      return transformed;
    }

    return data;
  }

  static transformResponse(data: any): any {
    if (!data) return data;

    if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data)) {
      return DateTransform.deserialize(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => DateTransform.transformResponse(item));
    }

    if (typeof data === 'object') {
      const transformed: Record<string, any> = {};
      for (const [key, value] of Object.entries(data)) {
        transformed[key] = DateTransform.transformResponse(value);
      }
      return transformed;
    }

    return data;
  }
}