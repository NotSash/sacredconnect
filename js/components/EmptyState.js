// ================================================
// SCComponents.EmptyState - Empty/No Data Component
// No-module, production-safe helper
// ================================================

(function () {
  const EmptyState = {
    render: function (options) {
      options = options || {};
      const icon = options.icon || 'fas fa-inbox';
      const title = options.title || 'Nothing here yet';
      const description = options.description || 'There is nothing to display right now.';
      const action = options.action || null;

      return ''
        + '<div class="empty-state">'
        + '  <div class="empty-state-icon"><i class="' + icon + '"></i></div>'
        + '  <h3 class="empty-state-title">' + title + '</h3>'
        + '  <p class="empty-state-desc">' + description + '</p>'
        + (action ? (
          '  <button class="btn ' + (action.className || 'btn-primary') + '" onclick="' + (action.onClick || '') + '">' 
          + (action.icon ? ('<i class="fas ' + action.icon + '"></i>') : '')
          + action.text
          + '</button>'
        ) : '')
        + '</div>';
    },

    noPandits: function () {
      return this.render({
        icon: 'fas fa-user-tie',
        title: 'No Pandits Available',
        description: 'We are onboarding verified pandits in your area. Please check back soon.',
        action: {
          text: 'Join as Pandit',
          icon: 'fa-user-plus',
          onClick: "Router.navigate('/pandit/register')"
        }
      });
    },

    noServices: function () {
      return this.render({
        icon: 'fas fa-layer-group',
        title: 'No Ceremonies Found',
        description: 'We couldn\'t find ceremonies matching your filters.',
        action: {
          text: 'Browse Ceremonies',
          icon: 'fa-om',
          onClick: "Router.navigate('/services')"
        }
      });
    },

    noBookings: function () {
      return this.render({
        icon: 'fas fa-calendar-alt',
        title: 'No Bookings Yet',
        description: 'When you book a ceremony, it will appear here.',
        action: {
          text: 'Book Now',
          icon: 'fa-calendar-check',
          onClick: "Router.navigate('/book')"
        }
      });
    },

    notFound: function () {
      return this.render({
        icon: 'fas fa-map-signs',
        title: 'Page Not Found',
        description: 'The page you\'re looking for doesn\'t exist.',
        action: {
          text: 'Go Home',
          icon: 'fa-home',
          onClick: "Router.navigate('/home')"
        }
      });
    },

    error: function (message) {
      return this.render({
        icon: 'fas fa-triangle-exclamation',
        title: 'Something went wrong',
        description: message || 'Please try again in a moment.',
        action: {
          text: 'Refresh',
          icon: 'fa-rotate-right',
          onClick: 'window.location.reload()'
        }
      });
    }
  };

  window.SCComponents = window.SCComponents || {};
  window.SCComponents.EmptyState = EmptyState;
})();