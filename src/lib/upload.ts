export async function uploadFile(file: File, setProgress?: (p: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.upload.onprogress = (event) => {
      if (setProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const { url } = JSON.parse(xhr.responseText);
        resolve(url);
      } else {
        reject(xhr.responseText);
      }
    };

    xhr.onerror = () => reject('Upload failed');
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}
