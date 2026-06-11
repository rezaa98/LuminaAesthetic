async function test() {
  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(100)], {type: 'image/jpeg'});
    formData.append('image', blob, 'test.jpg');
    formData.append('language', 'en');
    formData.append('preferredModel', 'gemini-3.5-flash');

    const res = await fetch('http://localhost:3000/api/analyze-features', { method: 'POST', body: formData });
    console.log(res.status, await res.text());
  } catch (e) {
    console.error(e);
  }
}
test();
