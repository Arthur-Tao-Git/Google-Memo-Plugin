document.addEventListener('DOMContentLoaded', function() {
  loadMemos();
  loadUrls();
  
  document.getElementById('addMemo').addEventListener('click', addMemo);
  
  // 添加快捷键提示
  const shortcutInfo = document.createElement('div');
  shortcutInfo.className = 'shortcut-info';
  shortcutInfo.innerHTML = `
    <p>快捷键提示：</p>
    <p>- 打开备忘录：${navigator.platform.includes('Mac') ? 'Command+U' : 'Ctrl+U'}</p>
    <p>- 保存网址：${navigator.platform.includes('Mac') ? 'Command+I' : 'Ctrl+I'}</p>
  `;
  document.querySelector('.container').appendChild(shortcutInfo);
});

function loadMemos() {
  chrome.storage.local.get(['memos'], function(result) {
    const memos = result.memos || [];
    const memoList = document.getElementById('memoList');
    memoList.innerHTML = '';
    
    memos.forEach((memo, index) => {
      const memoDiv = document.createElement('div');
      memoDiv.className = 'memo-item';
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'content';
      contentDiv.textContent = memo;
      
      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'buttons';
      
      const copyButton = document.createElement('button');
      copyButton.textContent = '复制';
      copyButton.addEventListener('click', () => copyMemo(index));
      
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '删除';
      deleteButton.addEventListener('click', () => deleteMemo(index));
      
      buttonsDiv.appendChild(copyButton);
      buttonsDiv.appendChild(deleteButton);
      
      memoDiv.appendChild(contentDiv);
      memoDiv.appendChild(buttonsDiv);
      memoList.appendChild(memoDiv);
    });
  });
}

function loadUrls() {
  chrome.storage.local.get(['urls'], function(result) {
    const urls = result.urls || [];
    const urlList = document.getElementById('urlList');
    urlList.innerHTML = '';
    
    urls.forEach((urlItem, index) => {
      const urlDiv = document.createElement('div');
      urlDiv.className = 'url-item';
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'content';
      
      const link = document.createElement('a');
      link.href = urlItem.url;
      link.target = '_blank';
      link.textContent = urlItem.note || urlItem.url;
      contentDiv.appendChild(link);
      
      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'buttons';
      
      const editButton = document.createElement('button');
      editButton.textContent = '编辑';
      editButton.addEventListener('click', () => editUrlNote(index));
      
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '删除';
      deleteButton.addEventListener('click', () => deleteUrl(index));
      
      buttonsDiv.appendChild(editButton);
      buttonsDiv.appendChild(deleteButton);
      
      urlDiv.appendChild(contentDiv);
      urlDiv.appendChild(buttonsDiv);
      urlList.appendChild(urlDiv);
    });
  });
}

function addMemo() {
  const newMemo = document.getElementById('newMemo').value.trim();
  if (!newMemo) return;
  
  chrome.storage.local.get(['memos'], function(result) {
    const memos = result.memos || [];
    memos.push(newMemo);
    chrome.storage.local.set({ memos }, function() {
      document.getElementById('newMemo').value = '';
      loadMemos();
    });
  });
}

function copyMemo(index) {
  chrome.storage.local.get(['memos'], function(result) {
    const memos = result.memos || [];
    const textToCopy = memos[index];
    
    // 使用 Clipboard API 复制文本
    navigator.clipboard.writeText(textToCopy).then(() => {
      // 显示复制成功提示
      const copyButton = document.querySelectorAll('.memo-item')[index].querySelector('button');
      const originalText = copyButton.textContent;
      copyButton.textContent = '已复制!';
      copyButton.style.backgroundColor = '#4CAF50';
      
      // 2秒后恢复按钮原样
      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.style.backgroundColor = '#4285f4';
      }, 2000);
    }).catch(err => {
      console.error('复制失败:', err);
    });
  });
}

function deleteMemo(index) {
  // 添加删除确认
  if (confirm('确定要删除这条备忘录吗？')) {
    chrome.storage.local.get(['memos'], function(result) {
      const memos = result.memos || [];
      memos.splice(index, 1);
      chrome.storage.local.set({ memos }, () => {
        loadMemos(); // 重新加载显示
      });
    });
  }
}

function deleteUrl(index) {
  // 添加删除确认
  if (confirm('确定要删除这个网址吗？')) {
    chrome.storage.local.get(['urls'], function(result) {
      const urls = result.urls || [];
      urls.splice(index, 1);
      chrome.storage.local.set({ urls }, () => {
        loadUrls(); // 重新加载显示
      });
    });
  }
}

function editUrlNote(index) {
  chrome.storage.local.get(['urls'], function(result) {
    const urls = result.urls || [];
    const urlItem = urls[index];
    const newNote = prompt('请输入网址备注：', urlItem.note || '');
    
    if (newNote !== null) {
      urls[index].note = newNote.trim() || urlItem.title;
      chrome.storage.local.set({ urls }, () => {
        loadUrls();
      });
    }
  });
} 