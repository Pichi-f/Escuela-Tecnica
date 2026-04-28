(function () {
  const coursesGrid = document.querySelector('.courses-grid');
  const coursesCount = document.querySelector('.courses-count');
  const courseSourceUrl = window.COURSE_SOURCE_URL || '';
  const fallbackCourseData = window.FALLBACK_COURSE_DATA || [];
  let currentCourses = [];

  const iconMarkup = (icon) => `
    <div class="img-placeholder">
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5">${icon}</svg>
    </div>`;

  const dayLabel = (day) => ({
    Lu: 'Lu',
    Ma: 'Ma',
    Mi: 'Mi',
    Ju: 'Ju',
    Vi: 'Vi',
    Sa: 'Sa',
    Do: 'Do'
  }[day] || day);

  const toArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return value
        .split(/[\s,;|/]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  const normalizeCourse = (course, index = 0) => ({
    no: course.no ?? course.No ?? course['No.'] ?? index + 1,
    code: course.code ?? course.codeCourse ?? course['SAE SAP'] ?? course.saeSap ?? '',
    name: course.name ?? course.nombre ?? course['Nombre'] ?? '',
    teacher: course.teacher ?? course.catedratico ?? course['Nombre de catedrático'] ?? course['Nombre de catedratico'] ?? '',
    startTime: course.startTime ?? course.inicio ?? course['Horario Inicio'] ?? '',
    endTime: course.endTime ?? course.final ?? course['Horario Final'] ?? '',
    days: toArray(course.days ?? course.dias ?? course['Días'] ?? course['Dias']),
    startDate: course.startDate ?? course.inicioClases ?? course['Inicio de clases'] ?? '',
    creditsUsac: course.creditsUsac ?? course.usac ?? course['USAC'] ?? '',
    creditsClar: course.creditsClar ?? course.clar ?? course['CLAR'] ?? '',
    classLink: course.classLink ?? course.linkClase ?? course['Link de clase'] ?? '',
    imageClass: course.imageClass ?? 'img-industria',
    icon: course.icon ?? '<path d="M2 20h20M6 20V10m12 10V10M2 10l10-7 10 7"/>'
  });

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const joinDays = (days) => (Array.isArray(days) && days.length ? days.map(dayLabel).join(' ') : 'Sin dato');

  const ensureModal = () => {
    let modal = document.querySelector('.course-modal-backdrop');

    if (modal) {
      return modal;
    }

    modal = document.createElement('div');
    modal.className = 'course-modal-backdrop';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="course-modal" role="dialog" aria-modal="true" aria-labelledby="course-modal-title">
        <button type="button" class="course-modal-close" aria-label="Cerrar detalles">×</button>
        <div class="course-modal-head">
          <span class="course-modal-badge"></span>
          <h2 id="course-modal-title"></h2>
          <p class="course-modal-subtitle"></p>
        </div>
        <div class="course-modal-grid">
          <div>
            <div class="course-modal-preview"></div>
            <div class="course-modal-note"></div>
          </div>
          <div class="course-modal-details"></div>
        </div>
      </div>`;

    document.body.appendChild(modal);

    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.closest('.course-modal-close')) {
        closeCourseModal();
      }
    });

    return modal;
  };

  const detailItemMarkup = (label, value, isHtml = false) => `
    <div class="course-detail-item">
      <span class="course-detail-label">${escapeHtml(label)}</span>
      <span class="course-detail-value">${isHtml ? value : escapeHtml(value)}</span>
    </div>`;

  const renderCourseModal = (course) => {
    const modal = ensureModal();
    const title = modal.querySelector('#course-modal-title');
    const subtitle = modal.querySelector('.course-modal-subtitle');
    const badge = modal.querySelector('.course-modal-badge');
    const preview = modal.querySelector('.course-modal-preview');
    const note = modal.querySelector('.course-modal-note');
    const details = modal.querySelector('.course-modal-details');

    if (!title || !subtitle || !badge || !preview || !note || !details) {
      return;
    }

    title.textContent = `${course.code ? `${course.code} · ` : ''}${course.name}`;
    subtitle.textContent = course.teacher ? `Docente: ${course.teacher}` : 'Sin docente registrado';
    preview.innerHTML = `
      <div class="course-modal-card ${course.imageClass}">
        ${iconMarkup(course.icon)}
      </div>`;

    note.innerHTML = course.classLink
      ? `<a class="course-modal-link" href="${escapeHtml(course.classLink)}" target="_blank" rel="noopener noreferrer">Abrir enlace de clase</a>`
      : '<span>Este curso no tiene enlace de clase publicado.</span>';

    details.innerHTML = [
      detailItemMarkup('No.', escapeHtml(course.no)),
      detailItemMarkup('Código', escapeHtml(course.code || 'Sin dato')),
      detailItemMarkup('Nombre', escapeHtml(course.name || 'Sin dato')),
      detailItemMarkup('Catedrático', escapeHtml(course.teacher || 'Sin dato')),
      detailItemMarkup('Horario', escapeHtml(`${course.startTime || '??'} - ${course.endTime || '??'}`)),
      detailItemMarkup('Días', escapeHtml(joinDays(course.days))),
      detailItemMarkup('Inicio de clases', escapeHtml(course.startDate || 'Sin dato')),
      detailItemMarkup('Créditos USAC', escapeHtml(course.creditsUsac || 'Sin dato')),
      detailItemMarkup('Créditos CLAR', escapeHtml(course.creditsClar || 'Sin dato')),
      detailItemMarkup('Enlace de clase', course.classLink ? `<a href="${escapeHtml(course.classLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(course.classLink)}</a>` : 'Sin enlace', true)
    ].join('');

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  };

  const closeCourseModal = () => {
    const modal = document.querySelector('.course-modal-backdrop');
    if (!modal) {
      return;
    }

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  const cardMarkup = (course, index) => `
    <div class="card">
      <div class="card-img ${course.imageClass}">
        ${iconMarkup(course.icon)}
      </div>
      <div class="card-body">
        <div class="card-title">${course.code ? `${course.code} · ` : ''}${course.name}</div>
        <div class="card-desc">Docente: ${course.teacher}</div>
        <div class="card-meta">
          <div class="meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${course.startTime} - ${course.endTime}
          </div>
          <div class="meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            ${course.days.map(dayLabel).join(' ')}
          </div>
          <div class="meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            USAC ${course.creditsUsac} / CLAR ${course.creditsClar}
          </div>
        </div>
        <div class="card-desc" style="margin-top: 10px;">Inicio de clases: ${course.startDate}</div>
        ${course.classLink ? '<div class="card-desc" style="margin-top: 6px;">Link de clase disponible</div>' : ''}
      </div>
      <div class="card-footer">
        <button class="btn-detail" data-course-index="${index}">
          Ver detalles del curso
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>`;

  const renderCourses = (courses) => {
    if (!coursesGrid || !coursesCount) {
      return;
    }

    const normalizedCourses = courses.map(normalizeCourse);
    currentCourses = normalizedCourses;

    coursesGrid.innerHTML = `${normalizedCourses.map(cardMarkup).join('')}<div class="card-upcoming">
      <div class="upcoming-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
      </div>
      <div class="upcoming-title">Próximas Aperturas</div>
      <div class="upcoming-desc">Estamos constantemente actualizando nuestra oferta académica con nuevos diplomados y certificaciones técnicas.</div>
      <button class="btn-subscribe">Suscribirse a novedades</button>
    </div>`;

    coursesCount.textContent = `Mostrando ${normalizedCourses.length} resultados disponibles`;
  };

  if (coursesGrid) {
    coursesGrid.addEventListener('click', (event) => {
      const button = event.target.closest('.btn-detail');
      if (!button) {
        return;
      }

      const index = Number(button.dataset.courseIndex);
      const course = currentCourses[index];

      if (course) {
        renderCourseModal(course);
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeCourseModal();
    }
  });

  const loadCourses = async () => {
    if (!courseSourceUrl) {
      renderCourses(fallbackCourseData);
      return;
    }

    try {
      const response = await fetch(courseSourceUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const remoteCourses = await response.json();
      const sourceCourses = Array.isArray(remoteCourses)
        ? remoteCourses
        : Array.isArray(remoteCourses?.courses)
          ? remoteCourses.courses
          : Array.isArray(remoteCourses?.items)
            ? remoteCourses.items
            : [];

      renderCourses(sourceCourses.length ? sourceCourses : fallbackCourseData);
    } catch (error) {
      renderCourses(fallbackCourseData);
    }
  };

  loadCourses();
})();
