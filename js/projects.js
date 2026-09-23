const filterButtons = document.querySelectorAll('.filter-button');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedCategory = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });

    projectCards.forEach((card) => {
      card.hidden = selectedCategory !== 'todos' && card.dataset.category !== selectedCategory;
    });
  });
});
