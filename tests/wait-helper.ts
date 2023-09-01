export default async function wait(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    const st = setTimeout(() => {
      resolve();
      st.unref();
      clearTimeout(st);
    }, seconds * 1000);
  });
}
